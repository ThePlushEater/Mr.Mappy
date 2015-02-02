<?php
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    
    require('database.php');
	
	$db = new database;
	$dbhost = $db->host;
	$dbuser = $db->username;
	$dbpass = $db->password; 
	$dbname = $db->db_name;

	// Create connection
	$conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	}
  
	
	// Create database
	$sql = "DROP TABLE IF EXISTS mp_give, mp_item, mp_layer, mp_picture;";
	if ($conn->query($sql) === TRUE) {
		echo "Database is dropped successfully";
	} else {
		echo "Error dropping database: " . $conn->error;
	}
	$conn->close();
	
?>