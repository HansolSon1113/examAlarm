<?php 

if ($_FILES["file"]["error"] > 0) {
    echo "Error: " .$_FILES["file"]["error"]. "<br>";

} else {
    // Check file size
    if ($_FILES["file"]["size"] > 20485760) { // 20 MB
        echo "ERROR: Your file is larger than 20 MB. Please upload a smaller one.";    
    } else { uploadImage(); }

}// ./ If


// UPLOAD IMAGE ------------------------------------------
function uploadImage() {
    // generate a unique random string
    $filePath = "upload/".basename($_FILES["file"]["name"]);

    // upload image into the 'uploads' folder
    move_uploaded_file($_FILES['file']['tmp_name'], $filePath);

    // echo the link of the uploaded image
    echo $filePath;
}

?>
