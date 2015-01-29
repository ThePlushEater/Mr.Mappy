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
        $sql = "SELECT * FROM `mp_item` WHERE (`id` = :id)";
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
        $sql = "UPDATE `mp_item` SET `name` = :name, `desc` = :desc, `type` = :type, `sort` = :sort, `amount` = :amount, `lat` = :lat, `lng` = :lng, `date` = :date, `update` = :update  WHERE (`id` = :id)";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "id" => $data->{'id'},
            "name" => $data->{'name'},
            "desc" => $data->{'desc'},
            "type" => $data->{'type'},
            "sort" => $data->{'sort'},
            "amount" => $data->{'amount'},
            "lat" => $data->{'lat'},
            "lng" => $data->{'lng'},
            "date" => $data->{'date'},
            "update" => date("Y-m-d H:i:s"),
        );
        
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $sql = "SELECT * FROM `mp_item` WHERE `id` = :id";
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
    
    function create() {
        $sql = "INSERT INTO `mp_item` VALUES ( NULL, :name, :desc, :type, :sort, :amount, :lat, :lng, :date, :update )";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "name" => $data->{'name'},
            "desc" => $data->{'desc'},
            "type" => $data->{'type'},
            "sort" => $data->{'sort'},
            "amount" => $data->{'amount'},
            "lat" => $data->{'lat'},
            "lng" => $data->{'lng'},
            "date" => $data->{'date'},
            "update" => date("Y-m-d H:i:s"),
        );
        
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            $sql = "SELECT * FROM `mp_item` WHERE `id` = :id";
            $params = array(
                "id" => $pdo->lastInsertId(),
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
        $sql = "DELETE FROM `mp_item` WHERE `id` = :id";
        $data = json_decode(file_get_contents('php://input'));
        $params = array(
            "id" => $data->{'id'},
        );
        try {
            $pdo = getConnection();
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute($params);
            
            // get taker data & re-calculate amount of taker
            $sql = "SELECT * FROM `mp_give` WHERE `gid` = :gid";
            $params = array(
                "gid" => $data->{'id'},
            );
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            foreach ($rows as $row) {
                $tid = $row->tid;
                $cut = $row->amount;
                $sql = "SELECT * FROM `mp_item` WHERE `id` = :id";
                $params = array(
                    "id" => $tid,
                );
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $item = $stmt->fetchAll(PDO::FETCH_OBJ);
                $amount = $item[0]->amount - $cut;
                
                // update item
                $sql = "UPDATE `mp_item` SET `amount` = :amount WHERE `id` = :id";
                $params = array(
                    "id" => $tid,
                    "amount" => $amount,
                );
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }
                
            // delete give data
            $sql = "DELETE FROM `mp_give` WHERE `gid` = :gid";
            $params = array(
                "gid" => $data->{'id'},
            );
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            
            
            $pdo = null;
            echo json_encode($result);
        } catch(PDOException $e) {
            echo '{"error":{"text":'. $e->getMessage() .'}}';
        }
    }
?>