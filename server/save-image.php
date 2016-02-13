<?php


$image = $_FILES['image'];
$rotation = $_POST['rotation'];

$uploaddir = 'uploads/';
$absolutedir = 'server/';
$path_parts = pathinfo($image['name']);
$uploadfile = $uploaddir . $path_parts['filename'] . '_' . uniqid() . '.' .$path_parts['extension'];


$error = false;
if (!move_uploaded_file($image['tmp_name'], $uploadfile)) {
    $error = true;
} 

echo json_encode(array(
	'error' => $error,
	'name' => basename($uploadfile),
	'url' => $absolutedir . $uploadfile
));


?>