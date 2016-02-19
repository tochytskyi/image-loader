<?php


$file = $_FILES['imagePreview']['tmp_name'];
$image = file_get_contents($file);
$type = pathinfo($_FILES['imagePreview']['name'], PATHINFO_EXTENSION);
$base64 = 'data:image/' . $type . ';base64,' . base64_encode($image);

echo json_encode(array(
	'url' => $base64
));


?>