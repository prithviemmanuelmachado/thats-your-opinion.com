
const baseURI = 'http://localhost:3000';

//function to get all items to be reviwed
function getAllReviewItems()
{
    console.log("Starting getAllReviewItems function");

    let postsArea = document.getElementById("posts-area");
    
    //ajax request to get the items from server
        //response should be a list of Item ids and titles
    //convert json to array of object

    //convert them into a single string with appropriate tags in between them
    let list = '<ul class="post-items w-100">'
    let reviewItems = test;
    reviewItems.forEach(item => {
        list += '<li class="my-2 w-100"><button type="button" class="btn btn-primary w-100 regular-font-size px-5" data-toggle="modal" data-target="#postModal" data-item-id="'+item.ItemId+'">'+item.Title+'</button></li>';
    });
    list += '</ul>';

    //put it into the postArea using innerHTML
    postsArea.innerHTML = list;

    console.log("Exiting getAllReviewItems function");

}

//adding the item details onto the modal using jquery
$('#postModal').on('show.bs.modal', function (event) {
    //getting button that triggered the modal
    var button = $(event.relatedTarget); 
    // extracting info from data-* attributes
    var id = button.data('item-id'); 
    //ajax call to get details of the item

    //update details to the modal
    var modal = $(this)
    modal.find('.modal-title').text(test[id-1].Title);
  })

//function to add new item to be reviwed
function addNewReviewItem()
{
    console.log("Starting addNewReviewItem function");
    
    //clear error message
    let errorMessage = document.getElementById("error-message");
    errorMessage.innerText = "";

    //ajax request to add the item
        //add token to the header if it exists else the post is anonymous
    
    //get response here
    let isItemAdded = true;

    //if item is added close the modal
    if(isItemAdded)
    {
        let closeButton = document.getElementById("close-modal");
        closeButton.click();
    }
    //if item is not added display error message
    else 
    {
        errorMessage.innerText = "Error message here";
    }

    console.log("Exiting addNewReviewItem function");

}

//function to register user
function registerUser()
{
    console.log("Starting registerUser function");

    const username = document.getElementById("Username").value;
    const password = document.getElementById("Password").value;
    const cPassword = document.getElementById("CPassword").value;
    const error = document.getElementById("error-message");
    
    if(username == "" || password == "" || cPassword == "")
    {
        error.innerText = "Please fill all fields"
    }
    else
    {
        //check if passwords are same
        if(password == cPassword)
        {
            //ajax request to add new user to server
            const input = { "username":username, "password":password };
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            };
            fetch(baseURI+'/registerUser', requestOptions)
            .then(res => {
                return res.json()
            }).then(data => {
                //if user not registered print error error
                if(data.Error)
                    error.innerText = data.Error;
                //if user registered redirect to login
                else 
                {
                    alert("Registration successful");
                    location.href = './login.html';
                }
            })
            .catch(err => console.log(err));
            
        }
        else 
            error.innerText = "Passwords do not match";
    }
    
    console.log("Exiting registerUser function");
}

//function to login user
function loginUser()
{
    console.log("Starting loginUser function");

    //ajax request to the login user to the server
    //if correct credentials are sent 
        //token recived and stored in local storage
        //redirected to home page
    //else show error message

    console.log("Exiting loginUser function");
}