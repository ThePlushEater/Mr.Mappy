<?php
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    
    require('database.php');	
    function getConnection() {
        $db = new database;
        $dbhost = $db->host;
        $dbuser = $db->username;
        $dbpass = $db->password; 
        $dbname = $db->db_name;
        $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbh;
    }

    switch($_SERVER['REQUEST_METHOD']){
        case 'POST':
            create();
            break;
        case 'GET':
            read();
            break;
        case 'PUT':
            update();
            break;
        case 'DELETE':
            delete();
            break;
    }
    
    function read() {
        $sql = "SELECT * FROM `mp_give` WHERE (`id` = :id)";
        $data = json_decode(file_get_contents('php://input'));
        $params = null;
        if ($data != null) {
            $params = array(
                "id" => $data->{'id'},
            );
        } else {
            $params = array(
                "id" => $_GET['id'],
            );
        }
        
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $pdo = null;
            echo json_encode($result);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
    
    function update() {
        $sql = "UPDATE `mp_give` SET `tid` = :tid, `gid` = :gid, `name` = :name, `desc` = :desc, `amount` = :amount, `date` = :date, `update` = :update  WHERE (`id` = :id)";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "id" => $data->{'id'},
            "tid" => $data->{'tid'},
            "gid" => $data->{'gid'},
            "name" => $data->{'name'},
            "desc" => $data->{'desc'},
            "amount" => $data->{'amount'},
            "date" => $data->{'date'},
            "update" => date("Y-m-d H:i:s"),
        );
        
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            
            // calculate amount
            $sql = "SELECT * FROM `mp_give` WHERE `tid` = :tid";
            $params = array(
                "tid" => $data->{'tid'},
            );
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                $amount = 0;
                foreach ($rows as $row) {
                    $amount += $row->amount;
                }
                
                // update amount in item
                $sql = "UPDATE `mp_item` SET `amount` = :amount WHERE `id` = :id";
                $params = array(
                    "id" => $data->{'tid'},
                    "amount" => $amount,
                );
                try {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                    //$result = $stmt->fetchAll(PDO::FETCH_OBJ);
                } catch(PDOException $e) {
                    echo '{"error":{"text":'. $e->getMessage() .'}}';
                }
                
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
            
            
            // get type number of giver
            $sql = "SELECT * FROM `mp_item` WHERE `id` = :id";
            $params = array(
                "id" => $data->{'gid'},
            );
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                $type = 0;
                foreach ($rows as $row) {
                    $type = $row->type;
                }
                if ($type == 3) {
                    $sql = "SELECT * FROM `mp_give` WHERE `gid` = :gid";
                    $params = array(
                        "gid" => $data->{'gid'},
                    );
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                    $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                    $amount = 0;
                    foreach ($rows as $row) {
                        $amount += $row->amount;
                    }
                    // update amount in item
                    $sql = "UPDATE `mp_item` SET `amount` = :amount WHERE `id` = :id";
                    $params = array(
                        "id" => $data->{'gid'},
                        "amount" => $amount,
                    );
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                }
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
            
            
            
            //return current give info
            $sql = "SELECT * FROM `mp_give` WHERE (`id` = :id)";
            $params = array(
                "id" => $data->{'id'},
            );
            
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
                $pdo = null;
                echo json_encode($result);
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
    
    function delete() {
        $sql = "DELETE FROM `mp_give` WHERE `id` = :id";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "id" => $data->{'id'},
        );
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute($params);
            $pdo = null;
            echo json_encode($result);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
    
    function create() {
        $sql = "INSERT INTO `mp_give` VALUES ( NULL, :tid, :gid, :name, :desc, :amount, :date, :update )";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "tid" => $data->{'tid'},
            "gid" => $data->{'gid'},
            "name" => $data->{'name'},
            "desc" => $data->{'desc'},
            "amount" => $data->{'amount'},
            "date" => $data->{'date'},
            "update" => date("Y-m-d H:i:s"),
        );
        
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $lastId = $pdo->lastInsertId();
            
            // calculate amount
            $sql = "SELECT * FROM `mp_give` WHERE `tid` = :tid";
            $params = array(
                "tid" => $data->{'tid'},
            );
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                $amount = 0;
                foreach ($rows as $row) {
                    $amount += $row->amount;
                }
                
                // update amount in item
                $sql = "UPDATE `mp_item` SET `amount` = :amount WHERE `id` = :id";
                $params = array(
                    "id" => $data->{'tid'},
                    "amount" => $amount,
                );
                try {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                    //$result = $stmt->fetchAll(PDO::FETCH_OBJ);
                } catch(PDOException $e) {
                    echo '{"error":{"text":'. $e->getMessage() .'}}';
                }
                
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
            
            
            // get type number of giver
            $sql = "SELECT * FROM `mp_item` WHERE `id` = :id";
            $params = array(
                "id" => $data->{'gid'},
            );
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                $type = 0;
                foreach ($rows as $row) {
                    $type = $row->type;
                }
                if ($type == 3) {
                    $sql = "SELECT * FROM `mp_give` WHERE `gid` = :gid";
                    $params = array(
                        "gid" => $data->{'gid'},
                    );
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                    $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                    $amount = 0;
                    foreach ($rows as $row) {
                        $amount += $row->amount;
                    }
                    // update amount in item
                    $sql = "UPDATE `mp_item` SET `amount` = :amount WHERE `id` = :id";
                    $params = array(
                        "id" => $data->{'gid'},
                        "amount" => $amount,
                    );
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($params);
                }
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
            
            
            $sql = "SELECT * FROM `mp_give` WHERE `id` = :id";
            $params = array(
                "id" => $lastId,
            );
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
                $pdo = null;
                echo json_encode($result);
            } catch(PDOException $e) {
                echo '{"error":{"text":'. $e->getMessage() .'}}';
            }
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
?>