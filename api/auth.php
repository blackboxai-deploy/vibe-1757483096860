<?php
/**
 * Authentication API
 * Handles user login and session management
 */

require_once 'config/database.php';

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session
session_start();

class AuthAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * User login
     */
    public function login($email, $password) {
        try {
            // Validate input
            if (empty($email) || empty($password)) {
                return [
                    'success' => false,
                    'message' => 'Email and password are required'
                ];
            }

            // Find user by email
            $query = "SELECT id, name, email, password, role FROM users WHERE email = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$email]);

            if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Verify password
                if (password_verify($password, $user['password'])) {
                    // Set session
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['user_role'] = $user['role'];
                    $_SESSION['logged_in'] = true;

                    // Update last login
                    $update_query = "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                    $update_stmt = $this->conn->prepare($update_query);
                    $update_stmt->execute([$user['id']]);

                    return [
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => [
                            'id' => (int)$user['id'],
                            'name' => $user['name'],
                            'email' => $user['email'],
                            'role' => $user['role']
                        ],
                        'token' => session_id()
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Invalid password'
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Login error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * User logout
     */
    public function logout() {
        try {
            // Destroy session
            $_SESSION = array();
            
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            session_destroy();

            return [
                'success' => true,
                'message' => 'Logout successful'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Logout error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if user is authenticated
     */
    public function checkAuth() {
        try {
            if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
                // Get current user info
                $query = "SELECT id, name, email, role FROM users WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$_SESSION['user_id']]);

                if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    return [
                        'success' => true,
                        'authenticated' => true,
                        'user' => [
                            'id' => (int)$user['id'],
                            'name' => $user['name'],
                            'email' => $user['email'],
                            'role' => $user['role']
                        ]
                    ];
                }
            }

            return [
                'success' => true,
                'authenticated' => false,
                'message' => 'Not authenticated'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Auth check error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Register new user (admin only)
     */
    public function register($data) {
        try {
            // Check if current user is admin
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
                return [
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ];
            }

            // Validate input
            $required_fields = ['name', 'email', 'password', 'role'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => "Missing required field: {$field}"
                    ];
                }
            }

            // Check if email already exists
            $check_query = "SELECT COUNT(*) FROM users WHERE email = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$data['email']]);
            if ($check_stmt->fetchColumn() > 0) {
                return [
                    'success' => false,
                    'message' => 'Email already exists'
                ];
            }

            // Validate role
            $valid_roles = ['admin', 'hr', 'employee'];
            if (!in_array($data['role'], $valid_roles)) {
                return [
                    'success' => false,
                    'message' => 'Invalid role. Must be admin, hr, or employee.'
                ];
            }

            // Hash password
            $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);

            // Insert new user
            $query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['name'],
                $data['email'],
                $password_hash,
                $data['role']
            ]);

            $user_id = $this->conn->lastInsertId();

            return [
                'success' => true,
                'message' => 'User registered successfully',
                'user' => [
                    'id' => (int)$user_id,
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'role' => $data['role']
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Registration error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Change password
     */
    public function changePassword($data) {
        try {
            // Check if user is authenticated
            if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
                return [
                    'success' => false,
                    'message' => 'Authentication required'
                ];
            }

            // Validate input
            if (!isset($data['current_password']) || !isset($data['new_password'])) {
                return [
                    'success' => false,
                    'message' => 'Current password and new password are required'
                ];
            }

            // Get current user password
            $query = "SELECT password FROM users WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$_SESSION['user_id']]);

            if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Verify current password
                if (password_verify($data['current_password'], $user['password'])) {
                    // Hash new password
                    $new_password_hash = password_hash($data['new_password'], PASSWORD_DEFAULT);

                    // Update password
                    $update_query = "UPDATE users SET password = ? WHERE id = ?";
                    $update_stmt = $this->conn->prepare($update_query);
                    $update_stmt->execute([$new_password_hash, $_SESSION['user_id']]);

                    return [
                        'success' => true,
                        'message' => 'Password changed successfully'
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Current password is incorrect'
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Password change error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get all users (admin only)
     */
    public function getUsers() {
        try {
            // Check if current user is admin
            if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
                return [
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ];
            }

            $query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $users = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $users[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'role' => $row['role'],
                    'created_at' => $row['created_at']
                ];
            }

            return [
                'success' => true,
                'data' => $users,
                'count' => count($users)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ];
        }
    }
}

// Handle the API request
try {
    $api = new AuthAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if (isset($_GET['check'])) {
                echo json_encode($api->checkAuth());
            } elseif (isset($_GET['users'])) {
                echo json_encode($api->getUsers());
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid request']);
            }
            break;

        case 'POST':
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'login':
                        echo json_encode($api->login($input['email'], $input['password']));
                        break;
                    case 'logout':
                        echo json_encode($api->logout());
                        break;
                    case 'register':
                        echo json_encode($api->register($input));
                        break;
                    case 'change_password':
                        echo json_encode($api->changePassword($input));
                        break;
                    default:
                        echo json_encode(['success' => false, 'message' => 'Invalid action']);
                }
            } else {
                // Default to login for backward compatibility
                echo json_encode($api->login($input['email'] ?? '', $input['password'] ?? ''));
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'API Error: ' . $e->getMessage()
    ]);
}
?>