<?php
/**
 * Dashboard API
 * Provides aggregated statistics for the dashboard
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

class DashboardAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats() {
        try {
            $today = date('Y-m-d');
            $stats = [];

            // Total Employees
            $query = "SELECT COUNT(*) FROM employees WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['totalEmployees'] = (int)$stmt->fetchColumn();

            // Monthly Payroll
            $query = "SELECT SUM(net_pay) 
                     FROM payroll 
                     WHERE MONTH(pay_period_end) = MONTH(CURRENT_DATE) 
                     AND YEAR(pay_period_end) = YEAR(CURRENT_DATE)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['monthlyPayroll'] = (float)($stmt->fetchColumn() ?? 0);

            // Total Payroll (all time)
            $query = "SELECT SUM(net_pay) FROM payroll";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['totalPayroll'] = (float)($stmt->fetchColumn() ?? 0);

            // Pending Payrolls
            $query = "SELECT COUNT(*) FROM payroll WHERE status = 'pending'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['pendingPayrolls'] = (int)$stmt->fetchColumn();

            // Present Today
            $query = "SELECT COUNT(*) FROM attendance WHERE date = ? AND status IN ('present', 'late')";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$today]);
            $stats['presentToday'] = (int)$stmt->fetchColumn();

            // Average Salary
            $query = "SELECT AVG(base_salary) FROM employees WHERE status = 'active'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['averageSalary'] = (float)($stmt->fetchColumn() ?? 0);

            // Total Deductions (this month)
            $query = "SELECT SUM(total_deductions) 
                     FROM payroll 
                     WHERE MONTH(pay_period_end) = MONTH(CURRENT_DATE) 
                     AND YEAR(pay_period_end) = YEAR(CURRENT_DATE)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['totalDeductions'] = (float)($stmt->fetchColumn() ?? 0);

            // Attendance Rate
            if ($stats['totalEmployees'] > 0) {
                $stats['attendanceRate'] = round(($stats['presentToday'] / $stats['totalEmployees']) * 100, 1);
            } else {
                $stats['attendanceRate'] = 0;
            }

            // Department Breakdown
            $query = "SELECT department, COUNT(*) as count, AVG(base_salary) as avg_salary 
                     FROM employees 
                     WHERE status = 'active' 
                     GROUP BY department 
                     ORDER BY count DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $departments = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $departments[] = [
                    'name' => $row['department'],
                    'employees' => (int)$row['count'],
                    'average_salary' => (float)$row['avg_salary']
                ];
            }
            $stats['departments'] = $departments;

            // Recent Activities (last 10 activities)
            $activities = [];
            
            // Recent employee additions
            $query = "SELECT 'employee_added' as type, CONCAT(first_name, ' ', last_name) as details, created_at 
                     FROM employees 
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                     ORDER BY created_at DESC 
                     LIMIT 3";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $activities[] = [
                    'type' => 'Employee Added',
                    'description' => $row['details'] . ' joined the company',
                    'timestamp' => $row['created_at'],
                    'icon' => '👥'
                ];
            }

            // Recent payroll processing
            $query = "SELECT 'payroll_processed' as type, COUNT(*) as count, created_at 
                     FROM payroll 
                     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                     GROUP BY DATE(created_at) 
                     ORDER BY created_at DESC 
                     LIMIT 3";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $activities[] = [
                    'type' => 'Payroll Processed',
                    'description' => 'Processed payroll for ' . $row['count'] . ' employees',
                    'timestamp' => $row['created_at'],
                    'icon' => '💰'
                ];
            }

            // Recent attendance
            $query = "SELECT COUNT(*) as count, date 
                     FROM attendance 
                     WHERE date >= DATE_SUB(CURDATE(), INTERVAL 3 DAY) 
                     GROUP BY date 
                     ORDER BY date DESC 
                     LIMIT 3";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $activities[] = [
                    'type' => 'Attendance Recorded',
                    'description' => $row['count'] . ' employees recorded attendance',
                    'timestamp' => $row['date'] . ' 00:00:00',
                    'icon' => '⏰'
                ];
            }

            // Sort activities by timestamp and limit to 10
            usort($activities, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            $stats['recentActivities'] = array_slice($activities, 0, 10);

            // Payroll Trends (last 6 months)
            $trends = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = date('Y-m', strtotime("-$i months"));
                $month_name = date('M', strtotime("-$i months"));
                
                $query = "SELECT SUM(net_pay) 
                         FROM payroll 
                         WHERE DATE_FORMAT(pay_period_end, '%Y-%m') = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$month]);
                $amount = (float)($stmt->fetchColumn() ?? 0);
                
                $trends[] = [
                    'month' => $month_name,
                    'amount' => $amount
                ];
            }
            $stats['payrollTrends'] = $trends;

            // System Health
            $health = [
                'database' => 'online',
                'api' => 'running',
                'backup' => 'scheduled'
            ];

            // Check database health
            try {
                $this->conn->query("SELECT 1");
                $health['database'] = 'online';
            } catch (Exception $e) {
                $health['database'] = 'error';
            }

            $stats['systemHealth'] = $health;

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching dashboard statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get quick stats for widgets
     */
    public function getQuickStats() {
        try {
            $today = date('Y-m-d');
            $stats = [];

            // Today's stats
            $stats['today'] = [
                'present' => $this->getCount("SELECT COUNT(*) FROM attendance WHERE date = ? AND status IN ('present', 'late')", [$today]),
                'late' => $this->getCount("SELECT COUNT(*) FROM attendance WHERE date = ? AND status = 'late'", [$today]),
                'new_employees' => $this->getCount("SELECT COUNT(*) FROM employees WHERE DATE(created_at) = ?", [$today])
            ];

            // This month's stats
            $stats['month'] = [
                'payroll_total' => $this->getSum("SELECT SUM(net_pay) FROM payroll WHERE MONTH(pay_period_end) = MONTH(CURRENT_DATE) AND YEAR(pay_period_end) = YEAR(CURRENT_DATE)"),
                'employees_added' => $this->getCount("SELECT COUNT(*) FROM employees WHERE MONTH(created_at) = MONTH(CURRENT_DATE) AND YEAR(created_at) = YEAR(CURRENT_DATE)"),
                'payrolls_processed' => $this->getCount("SELECT COUNT(*) FROM payroll WHERE MONTH(created_at) = MONTH(CURRENT_DATE) AND YEAR(created_at) = YEAR(CURRENT_DATE)")
            ];

            // Overall stats
            $stats['overall'] = [
                'total_employees' => $this->getCount("SELECT COUNT(*) FROM employees WHERE status = 'active'"),
                'total_departments' => $this->getCount("SELECT COUNT(DISTINCT department) FROM employees WHERE status = 'active'"),
                'pending_payrolls' => $this->getCount("SELECT COUNT(*) FROM payroll WHERE status = 'pending'")
            ];

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching quick statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Helper method to get count
     */
    private function getCount($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Helper method to get sum
     */
    private function getSum($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return (float)($stmt->fetchColumn() ?? 0);
    }
}

// Handle the API request
try {
    $api = new DashboardAPI();
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (isset($_GET['quick'])) {
                echo json_encode($api->getQuickStats());
            } else {
                echo json_encode($api->getDashboardStats());
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