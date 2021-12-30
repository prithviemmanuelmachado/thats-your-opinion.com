let test = [
    {
        "ItemId" : 1,
        "Title" : "First Item",
        "Contact" : "Email,Test@124.com;Phone:1111111111",
        "Links" : "Home,www.google.com;Documentation,www.github.com",
        "Description" : "Test Description",
        "Reviews" : [
            {
                "By" : "Anonymous", 
                "Review" : "This is a test review"
            },
            {
                "By" : "User1", 
                "Review" : "This is a test review"
            }
        ]
    },
    {
        "ItemId" : 2,
        "Title" : "Second Item",
        "Contact" : "Email,Test@124.com;Mobile:2222211111",
        "Links" : "Home,www.facebook.com;Documentation,www.github.com",
        "Description" : "Test Description",
        "Reviews" : [
            {
                "By" : "User2", 
                "Review" : "This is a test review"
            },
            {
                "By" : "User1", 
                "Review" : "This is a test review"
            }
        ]
    },
    {
        "ItemId" : 3,
        "Title" : "Third Item",
        "Contact" : "Email,Test@124.com;Phone:1111111111",
        "Links" : "Home,www.google.com;Documentation,www.github.com",
        "Description" : "Test Description",
        "Reviews" : [
            {
                "By" : "Anonymous", 
                "Review" : "This is a test review"
            },
            {
                "By" : "User1", 
                "Review" : "This is a test review"
            }
        ]
    }
];

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
    
    //ajax request to add new user to server
    //if user registerd redirect to login
    //else show error messagee
    
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