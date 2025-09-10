<?php
/**
 * Attendance Management API
 * Handles employee attendance and time tracking
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

class AttendanceAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all attendance records
     */
    public function getAttendanceRecords() {
        try {
            $query = "SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_id, e.department 
                     FROM attendance a 
                     JOIN employees e ON a.employee_id = e.id 
                     ORDER BY a.date DESC, a.clock_in DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $attendance_records = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $attendance_records[] = [
                    'id' => (int)$row['id'],
                    'employee_id' => (int)$row['employee_id'],
                    'employee_name' => $row['first_name'] . ' ' . $row['last_name'],
                    'employee_code' => $row['emp_id'],
                    'department' => $row['department'],
                    'date' => $row['date'],
                    'clock_in' => $row['clock_in'],
                    'clock_out' => $row['clock_out'],
                    'hours_worked' => $row['hours_worked'] ? (float)$row['hours_worked'] : null,
                    'status' => $row['status'],
                    'notes' => $row['notes'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }

            return [
                'success' => true,
                'data' => $attendance_records,
                'count' => count($attendance_records)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching attendance records: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get attendance records for a specific date
     */
    public function getAttendanceByDate($date) {
        try {
            $query = "SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_id, e.department 
                     FROM attendance a 
                     JOIN employees e ON a.employee_id = e.id 
                     WHERE a.date = ?
                     ORDER BY a.clock_in DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$date]);

            $attendance_records = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $attendance_records[] = [
                    'id' => (int)$row['id'],
                    'employee_id' => (int)$row['employee_id'],
                    'employee_name' => $row['first_name'] . ' ' . $row['last_name'],
                    'employee_code' => $row['emp_id'],
                    'department' => $row['department'],
                    'date' => $row['date'],
                    'clock_in' => $row['clock_in'],
                    'clock_out' => $row['clock_out'],
                    'hours_worked' => $row['hours_worked'] ? (float)$row['hours_worked'] : null,
                    'status' => $row['status'],
                    'notes' => $row['notes'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }

            return [
                'success' => true,
                'data' => $attendance_records,
                'count' => count($attendance_records)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching attendance records: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Clock in employee
     */
    public function clockIn($employee_id) {
        try {
            // Validate employee exists and is active
            $emp_query = "SELECT * FROM employees WHERE id = ? AND status = 'active'";
            $emp_stmt = $this->conn->prepare($emp_query);
            $emp_stmt->execute([$employee_id]);
            $employee = $emp_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$employee) {
                return [
                    'success' => false,
                    'message' => 'Employee not found or inactive'
                ];
            }

            $today = date('Y-m-d');
            $current_time = date('H:i:s');

            // Check if already clocked in today
            $check_query = "SELECT * FROM attendance WHERE employee_id = ? AND date = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$employee_id, $today]);
            $existing_record = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_record) {
                if ($existing_record['clock_in'] && !$existing_record['clock_out']) {
                    return [
                        'success' => false,
                        'message' => 'Employee already clocked in today'
                    ];
                } elseif ($existing_record['clock_in'] && $existing_record['clock_out']) {
                    return [
                        'success' => false,
                        'message' => 'Employee already completed attendance for today'
                    ];
                }
            }

            // Determine status based on clock in time
            $status = 'present';
            $late_time = strtotime('09:00:00');
            $clock_in_time = strtotime($current_time);
            
            if ($clock_in_time > $late_time) {
                $status = 'late';
            }

            if ($existing_record) {
                // Update existing record
                $query = "UPDATE attendance 
                         SET clock_in = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                         WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$current_time, $status, $existing_record['id']]);
                $attendance_id = $existing_record['id'];
            } else {
                // Create new attendance record
                $query = "INSERT INTO attendance (employee_id, date, clock_in, status) 
                         VALUES (?, ?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$employee_id, $today, $current_time, $status]);
                $attendance_id = $this->conn->lastInsertId();
            }

            // Return the attendance record
            return $this->getAttendanceRecord($attendance_id);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error clocking in: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Clock out employee
     */
    public function clockOut($employee_id) {
        try {
            $today = date('Y-m-d');
            $current_time = date('H:i:s');

            // Find today's attendance record
            $query = "SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND clock_in IS NOT NULL";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$employee_id, $today]);
            $attendance = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$attendance) {
                return [
                    'success' => false,
                    'message' => 'No clock-in record found for today'
                ];
            }

            if ($attendance['clock_out']) {
                return [
                    'success' => false,
                    'message' => 'Employee already clocked out today'
                ];
            }

            // Calculate hours worked
            $clock_in_time = strtotime($attendance['clock_in']);
            $clock_out_time = strtotime($current_time);
            $hours_worked = ($clock_out_time - $clock_in_time) / 3600; // Convert to hours

            // Update attendance record
            $update_query = "UPDATE attendance 
                           SET clock_out = ?, hours_worked = ?, updated_at = CURRENT_TIMESTAMP 
                           WHERE id = ?";
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->execute([$current_time, round($hours_worked, 2), $attendance['id']]);

            // Return updated attendance record
            return $this->getAttendanceRecord($attendance['id']);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error clocking out: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get attendance record by ID
     */
    private function getAttendanceRecord($id) {
        try {
            $query = "SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_id, e.department 
                     FROM attendance a 
                     JOIN employees e ON a.employee_id = e.id 
                     WHERE a.id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);

            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                return [
                    'success' => true,
                    'data' => [
                        'id' => (int)$row['id'],
                        'employee_id' => (int)$row['employee_id'],
                        'employee_name' => $row['first_name'] . ' ' . $row['last_name'],
                        'employee_code' => $row['emp_id'],
                        'department' => $row['department'],
                        'date' => $row['date'],
                        'clock_in' => $row['clock_in'],
                        'clock_out' => $row['clock_out'],
                        'hours_worked' => $row['hours_worked'] ? (float)$row['hours_worked'] : null,
                        'status' => $row['status'],
                        'notes' => $row['notes'],
                        'created_at' => $row['created_at'],
                        'updated_at' => $row['updated_at']
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Attendance record not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching attendance record: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update attendance record
     */
    public function updateAttendance($id, $data) {
        try {
            // Check if record exists
            $check_query = "SELECT * FROM attendance WHERE id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$id]);
            $record = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$record) {
                return [
                    'success' => false,
                    'message' => 'Attendance record not found'
                ];
            }

            // Build dynamic update query
            $update_fields = [];
            $values = [];
            
            $allowed_fields = ['clock_in', 'clock_out', 'status', 'notes'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $update_fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($update_fields)) {
                return [
                    'success' => false,
                    'message' => 'No valid fields to update'
                ];
            }

            // Recalculate hours if clock times are updated
            if (isset($data['clock_in']) || isset($data['clock_out'])) {
                $clock_in = isset($data['clock_in']) ? $data['clock_in'] : $record['clock_in'];
                $clock_out = isset($data['clock_out']) ? $data['clock_out'] : $record['clock_out'];

                if ($clock_in && $clock_out) {
                    $clock_in_time = strtotime($clock_in);
                    $clock_out_time = strtotime($clock_out);
                    $hours_worked = ($clock_out_time - $clock_in_time) / 3600;
                    
                    $update_fields[] = "hours_worked = ?";
                    $values[] = round($hours_worked, 2);
                }
            }

            $values[] = $id;
            $query = "UPDATE attendance SET " . implode(', ', $update_fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($values);

            return $this->getAttendanceRecord($id);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating attendance: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get attendance statistics
     */
    public function getAttendanceStats() {
        try {
            $today = date('Y-m-d');
            $stats = [];

            // Present today
            $query = "SELECT COUNT(*) FROM attendance WHERE date = ? AND status IN ('present', 'late')";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$today]);
            $stats['present_today'] = (int)$stmt->fetchColumn();

            // Late today
            $query = "SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'late'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$today]);
            $stats['late_today'] = (int)$stmt->fetchColumn();

            // Total employees
            $query = "SELECT COUNT(*) FROM employees WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $total_employees = (int)$stmt->fetchColumn();
            $stats['total_employees'] = $total_employees;

            // Absent today
            $stats['absent_today'] = $total_employees - $stats['present_today'];

            // Attendance rate
            $stats['attendance_rate'] = $total_employees > 0 ? 
                round(($stats['present_today'] / $total_employees) * 100, 1) : 0;

            // Average hours this month
            $query = "SELECT AVG(hours_worked) 
                     FROM attendance 
                     WHERE hours_worked IS NOT NULL 
                     AND MONTH(date) = MONTH(CURRENT_DATE) 
                     AND YEAR(date) = YEAR(CURRENT_DATE)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['average_hours_month'] = round((float)$stmt->fetchColumn(), 1);

            // Department attendance today
            $query = "SELECT e.department, COUNT(a.id) as present_count, 
                            COUNT(DISTINCT e.id) as total_employees
                     FROM employees e 
                     LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ? 
                     WHERE e.status = 'active'
                     GROUP BY e.department";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$today]);
            
            $department_stats = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $attendance_rate = $row['total_employees'] > 0 ? 
                    round(($row['present_count'] / $row['total_employees']) * 100, 1) : 0;
                
                $department_stats[] = [
                    'department' => $row['department'],
                    'present' => (int)$row['present_count'],
                    'total' => (int)$row['total_employees'],
                    'rate' => $attendance_rate
                ];
            }
            $stats['department_breakdown'] = $department_stats;

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching attendance statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Mark employee as absent
     */
    public function markAbsent($employee_id, $date = null) {
        try {
            if (!$date) {
                $date = date('Y-m-d');
            }

            // Check if attendance record already exists
            $check_query = "SELECT * FROM attendance WHERE employee_id = ? AND date = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$employee_id, $date]);
            $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Update existing record
                $query = "UPDATE attendance SET status = 'absent', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$existing['id']]);
                $attendance_id = $existing['id'];
            } else {
                // Create new absent record
                $query = "INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, 'absent')";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$employee_id, $date]);
                $attendance_id = $this->conn->lastInsertId();
            }

            return $this->getAttendanceRecord($attendance_id);
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error marking absent: ' . $e->getMessage()
            ];
        }
    }
}

// Handle the API request
try {
    $api = new AttendanceAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if (isset($_GET['date'])) {
                echo json_encode($api->getAttendanceByDate($_GET['date']));
            } elseif (isset($_GET['stats'])) {
                echo json_encode($api->getAttendanceStats());
            } else {
                echo json_encode($api->getAttendanceRecords());
            }
            break;

        case 'POST':
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'clock_in':
                        echo json_encode($api->clockIn($input['employee_id']));
                        break;
                    case 'clock_out':
                        echo json_encode($api->clockOut($input['employee_id']));
                        break;
                    case 'mark_absent':
                        echo json_encode($api->markAbsent($input['employee_id'], $input['date'] ?? null));
                        break;
                    default:
                        echo json_encode(['success' => false, 'message' => 'Invalid action']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Action required']);
            }
            break;

        case 'PUT':
            if (isset($input['id'])) {
                echo json_encode($api->updateAttendance($input['id'], $input));
            } else {
                echo json_encode(['success' => false, 'message' => 'Attendance ID required']);
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