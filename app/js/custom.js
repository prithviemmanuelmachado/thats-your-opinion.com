
const baseURI = 'http://localhost:3000';

//function to initialize page
function initializePage()
{
    const User = document.getElementById('User');
    //if user is loggedin show login else show logout
    if(sessionStorage.getItem('jwt'))
    {
        const link = '<a class = "nav-link navigation" href = "./index.html" onclick = "return logout()">Logout</a>';
        User.innerHTML = link;

    }
    else
    {
        const link = '<a class = "nav-link navigation" href = "./login.html">Login</a>';
        User.innerHTML = link;
    }
    getAllReviewItems();
}

//function to logout
function logout()
{
    sessionStorage.removeItem('jwt');
    return true;
}

//function to get all items to be reviwed
function getAllReviewItems()
{ 
    
    console.log("Starting getAllReviewItems function");

    let postsArea = document.getElementById("posts-area");
    let list = '';
    //ajax request to get the items from server
        //response should be a list of Item ids and titles
    fetch(baseURI+'/items')
    .then(res => {return res.json()})
    .then((data) => {
        data.forEach(item => {
            const avg = item.NoOfStars / item.NoOfReviews;
            let card;
            if(avg > 2 && avg < 4)
                card = 'text-white bg-primary';
            else if(isNaN(avg))
                card = 'text-white bg-primary';
            else if(avg >= 2)
                card = 'text-white bg-danger';
            else
                card = 'text-white bg-success';
            list += '<div class="card '+card+' m-2 col-lg-3">';
            list += '<div class="card-header heading-font-size">'+item.Title+'</div>';
            list += '<div class="card-body">'
            list += '<button type="button" class="btn btn-secondary regular-font-size px-5" data-toggle="modal" data-target="#postModal" data-item-id="'+item.Title+'">Details</button>';
            list += '</div></div>';
        });
        //put it into the postArea using innerHTML
        postsArea.innerHTML = list;
    });

    

    

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
    fetch(baseURI + '/details?title='+ id)
    .then(res => {return res.json()})
    .then((data)=> {
        modal.find('.modal-title').text(data.Title);
        modal.find('#By').text(data.CreatedBy);
        const contacts = data.Contact.split(";");
        if(data.Contact == "")
            modal.find('#Contact').text("");
        else
        {
            let contactList = "";
            contacts.forEach(element => {
                let cur = element.split(",");
                contactList += cur[0] + ' : ' + cur[1] + '<br>';
            });
            modal.find('#Contact').html(contactList);
        }
        if(data.Links == "")
            modal.find('#Links').text("");
        else
        {
            const links = data.Links.split(";");
            let linksList = "";
            links.forEach(element => {
                let cur = element.split(",");
                linksList += cur[0] + ' : ' + cur[1] + '<br>';
            });
            modal.find('#Links').html(linksList);
        }
        if(data.Description == "")
            modal.find('#Desc').text("");
        else
        {
            const desc = data.Description.split("\n");
            let descList = "";
            desc.forEach(element => {
                descList += element + '<br>';
            });
            modal.find('#Desc').html(descList);
        }
    });
    
  })

//function to add new item to be reviwed
function addNewReviewItem()
{
    console.log("Starting addNewReviewItem function");
    
    let Title = document.getElementById("Title").value;
    let Contact = document.getElementById("Contact").value;
    let Links = document.getElementById("Links").value;
    let Desc = document.getElementById("Desc").value;
    const errorMessage = document.getElementById("error-message");

    //ajax request to add the item
        //add token to the header if it exists else the post is anonymous
    const headers = new Headers();
    if(sessionStorage.getItem('jwt'))
    {
        headers.append('jwt', sessionStorage.getItem('jwt'));
    }
    headers.append('Content-Type', 'application/json');
    const input = {Title , Contact, Links, Desc};
    fetch(baseURI+'/newItem', {
        headers : headers,
        method: 'POST',
        body: JSON.stringify(input)
    })
    .then(res => res.json())
    .then(data => {
        if(data.Error)
            errorMessage.innerText = data.Error;
        else
        {
            Title = "";
            Contact = "";
            Links = "";
            Desc = "";
            let closeButton = document.getElementById("close-modal");
            closeButton.click();
            location.href = './index.html';
        }
    });
    

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

    const username = document.getElementById("Username").value;
    const password = document.getElementById("Password").value;
    const error = document.getElementById("error-message");
    
    //ajax request to the login user to the server
    const input = { "username":username, "password":password };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    };
    fetch(baseURI+'/login', requestOptions)
    .then(res => { 
        return res.json();
    }).then(data => {
        //if correct credentials are sent 
            //token recived and stored in session storage
            //redirected to home page
        if(data.jwt)
        {
            alert("Logged in");
            sessionStorage.setItem('jwt', data.jwt);
            location.href = './index.html';
        }
        //else show error message
        else
            error.innerText = data.Error;
    });
    

    console.log("Exiting loginUser function");
}