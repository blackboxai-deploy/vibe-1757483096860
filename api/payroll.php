<?php
/**
 * Payroll Management API
 * Handles payroll processing and calculations
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

class PayrollAPI {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all payroll records
     */
    public function getPayrollRecords() {
        try {
            $query = "SELECT p.*, e.first_name, e.last_name, e.employee_id as emp_id 
                     FROM payroll p 
                     JOIN employees e ON p.employee_id = e.id 
                     ORDER BY p.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $payroll_records = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $payroll_records[] = [
                    'id' => (int)$row['id'],
                    'employee_id' => (int)$row['employee_id'],
                    'employee_name' => $row['first_name'] . ' ' . $row['last_name'],
                    'employee_code' => $row['emp_id'],
                    'pay_period' => $row['pay_period_start'] . ' to ' . $row['pay_period_end'],
                    'pay_period_start' => $row['pay_period_start'],
                    'pay_period_end' => $row['pay_period_end'],
                    'gross_pay' => (float)$row['gross_pay'],
                    'tax_deduction' => (float)$row['tax_deduction'],
                    'insurance_deduction' => (float)$row['insurance_deduction'],
                    'other_deductions' => (float)$row['other_deductions'],
                    'deductions' => (float)$row['total_deductions'],
                    'net_pay' => (float)$row['net_pay'],
                    'status' => $row['status'],
                    'processed_at' => $row['processed_at'],
                    'created_at' => $row['created_at']
                ];
            }

            return [
                'success' => true,
                'data' => $payroll_records,
                'count' => count($payroll_records)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching payroll records: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payroll record by ID
     */
    public function getPayrollRecord($id) {
        try {
            $query = "SELECT p.*, e.first_name, e.last_name, e.employee_id as emp_id 
                     FROM payroll p 
                     JOIN employees e ON p.employee_id = e.id 
                     WHERE p.id = ?";
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
                        'pay_period' => $row['pay_period_start'] . ' to ' . $row['pay_period_end'],
                        'pay_period_start' => $row['pay_period_start'],
                        'pay_period_end' => $row['pay_period_end'],
                        'gross_pay' => (float)$row['gross_pay'],
                        'tax_deduction' => (float)$row['tax_deduction'],
                        'insurance_deduction' => (float)$row['insurance_deduction'],
                        'other_deductions' => (float)$row['other_deductions'],
                        'total_deductions' => (float)$row['total_deductions'],
                        'net_pay' => (float)$row['net_pay'],
                        'status' => $row['status'],
                        'processed_at' => $row['processed_at'],
                        'created_at' => $row['created_at']
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Payroll record not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching payroll record: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process payroll for employees
     */
    public function processPayroll($data) {
        try {
            // Validate required fields
            $required_fields = ['start_date', 'end_date', 'selected_employees'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return [
                        'success' => false,
                        'message' => "Missing required field: {$field}"
                    ];
                }
            }

            $processed_records = [];
            
            // Process each selected employee
            foreach ($data['selected_employees'] as $employee_id) {
                // Get employee details
                $emp_query = "SELECT * FROM employees WHERE id = ? AND status = 'active'";
                $emp_stmt = $this->conn->prepare($emp_query);
                $emp_stmt->execute([$employee_id]);
                $employee = $emp_stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$employee) {
                    continue; // Skip if employee not found or inactive
                }

                // Check if payroll already exists for this period
                $check_query = "SELECT COUNT(*) FROM payroll 
                               WHERE employee_id = ? 
                               AND pay_period_start = ? 
                               AND pay_period_end = ?";
                $check_stmt = $this->conn->prepare($check_query);
                $check_stmt->execute([$employee_id, $data['start_date'], $data['end_date']]);
                
                if ($check_stmt->fetchColumn() > 0) {
                    continue; // Skip if payroll already exists
                }

                // Calculate payroll
                $gross_pay = $this->calculateGrossPay($employee, $data['start_date'], $data['end_date']);
                $tax_rate = isset($data['tax_rate']) ? (float)$data['tax_rate'] : 15.0;
                $insurance_rate = isset($data['insurance_rate']) ? (float)$data['insurance_rate'] : 5.0;
                $other_deductions = isset($data['other_deductions']) ? (float)$data['other_deductions'] : 0.0;

                $tax_deduction = ($gross_pay * $tax_rate) / 100;
                $insurance_deduction = ($gross_pay * $insurance_rate) / 100;
                $total_deductions = $tax_deduction + $insurance_deduction + $other_deductions;
                $net_pay = $gross_pay - $total_deductions;

                // Insert payroll record
                $insert_query = "INSERT INTO payroll 
                               (employee_id, pay_period_start, pay_period_end, gross_pay, 
                                tax_deduction, insurance_deduction, other_deductions, 
                                total_deductions, net_pay, status) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
                
                $insert_stmt = $this->conn->prepare($insert_query);
                $insert_stmt->execute([
                    $employee_id,
                    $data['start_date'],
                    $data['end_date'],
                    $gross_pay,
                    $tax_deduction,
                    $insurance_deduction,
                    $other_deductions,
                    $total_deductions,
                    $net_pay
                ]);

                $payroll_id = $this->conn->lastInsertId();
                $processed_records[] = $this->getPayrollRecord($payroll_id)['data'];
            }

            return [
                'success' => true,
                'message' => 'Payroll processed successfully',
                'data' => $processed_records,
                'count' => count($processed_records)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error processing payroll: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Calculate gross pay for an employee
     */
    private function calculateGrossPay($employee, $start_date, $end_date) {
        if ($employee['salary_type'] === 'monthly') {
            return (float)$employee['base_salary'];
        } else {
            // For hourly employees, calculate based on attendance
            $hours_query = "SELECT SUM(hours_worked) as total_hours 
                           FROM attendance 
                           WHERE employee_id = ? 
                           AND date BETWEEN ? AND ?";
            $hours_stmt = $this->conn->prepare($hours_query);
            $hours_stmt->execute([$employee['id'], $start_date, $end_date]);
            $result = $hours_stmt->fetch(PDO::FETCH_ASSOC);
            
            $total_hours = (float)($result['total_hours'] ?? 0);
            return $total_hours * (float)$employee['base_salary'];
        }
    }

    /**
     * Update payroll status
     */
    public function updatePayrollStatus($id, $status) {
        try {
            $valid_statuses = ['pending', 'processing', 'paid'];
            if (!in_array($status, $valid_statuses)) {
                return [
                    'success' => false,
                    'message' => 'Invalid status'
                ];
            }

            $query = "UPDATE payroll SET status = ?";
            $params = [$status];
            
            if ($status === 'paid') {
                $query .= ", processed_at = CURRENT_TIMESTAMP";
            }
            
            $query .= " WHERE id = ?";
            $params[] = $id;

            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);

            if ($stmt->rowCount() > 0) {
                return $this->getPayrollRecord($id);
            } else {
                return [
                    'success' => false,
                    'message' => 'Payroll record not found'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating payroll status: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get payroll statistics
     */
    public function getPayrollStats() {
        try {
            $stats = [];

            // Total payroll this month
            $query = "SELECT SUM(net_pay) as total 
                     FROM payroll 
                     WHERE MONTH(pay_period_end) = MONTH(CURRENT_DATE) 
                     AND YEAR(pay_period_end) = YEAR(CURRENT_DATE)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['monthly_total'] = (float)$stmt->fetchColumn();

            // Pending payrolls
            $query = "SELECT COUNT(*) FROM payroll WHERE status = 'pending'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['pending_count'] = (int)$stmt->fetchColumn();

            // Processed payrolls
            $query = "SELECT COUNT(*) FROM payroll WHERE status = 'paid'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['processed_count'] = (int)$stmt->fetchColumn();

            // Average salary
            $query = "SELECT AVG(gross_pay) FROM payroll";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['average_salary'] = (float)$stmt->fetchColumn();

            // Total deductions
            $query = "SELECT SUM(total_deductions) 
                     FROM payroll 
                     WHERE MONTH(pay_period_end) = MONTH(CURRENT_DATE) 
                     AND YEAR(pay_period_end) = YEAR(CURRENT_DATE)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $stats['total_deductions'] = (float)$stmt->fetchColumn();

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error fetching payroll statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete payroll record
     */
    public function deletePayrollRecord($id) {
        try {
            // Check if payroll record exists and is not paid
            $check_query = "SELECT status FROM payroll WHERE id = ?";
            $check_stmt = $this->conn->prepare($check_query);
            $check_stmt->execute([$id]);
            $record = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$record) {
                return [
                    'success' => false,
                    'message' => 'Payroll record not found'
                ];
            }

            if ($record['status'] === 'paid') {
                return [
                    'success' => false,
                    'message' => 'Cannot delete paid payroll records'
                ];
            }

            // Delete the record
            $query = "DELETE FROM payroll WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$id]);

            return [
                'success' => true,
                'message' => 'Payroll record deleted successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error deleting payroll record: ' . $e->getMessage()
            ];
        }
    }
}

// Handle the API request
try {
    $api = new PayrollAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                echo json_encode($api->getPayrollRecord($_GET['id']));
            } elseif (isset($_GET['stats'])) {
                echo json_encode($api->getPayrollStats());
            } else {
                echo json_encode($api->getPayrollRecords());
            }
            break;

        case 'POST':
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'process':
                        echo json_encode($api->processPayroll($input));
                        break;
                    case 'update_status':
                        echo json_encode($api->updatePayrollStatus($input['id'], $input['status']));
                        break;
                    default:
                        echo json_encode(['success' => false, 'message' => 'Invalid action']);
                }
            } else {
                echo json_encode($api->processPayroll($input));
            }
            break;

        case 'PUT':
            if (isset($input['id']) && isset($input['status'])) {
                echo json_encode($api->updatePayrollStatus($input['id'], $input['status']));
            } else {
                echo json_encode(['success' => false, 'message' => 'ID and status required']);
            }
            break;

        case 'DELETE':
            if (isset($input['id'])) {
                echo json_encode($api->deletePayrollRecord($input['id']));
            } else {
                echo json_encode(['success' => false, 'message' => 'Payroll ID required']);
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