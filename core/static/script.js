submitBtn = document.getElementById("submit");
userInpup = document.getElementById("userInput");
responseBox = document.getElementById("responseBox");

console.log({submitBtn,userInpup,responseBox});

submitBtn.addEventListener("click", function(e) {
    e.preventDefault();

    const endpoint = "https://augular-minds-email-generator.onrender.com/submit";
    // const endpoint = "http://localhost:5000/chats";
    fetch(endpoint,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({link: userInput.value})
    })
    .then((res)=>{
        console.log(res);
        if(res.ok)
            return res.json();
        else
            throw new Error("Network response was not ok " + response.statusText);
    })
    .then((data)=>{
        email = data.email;
        responseBox.value = email;
    })
    .catch((err)=>{
        console.log(err);
    });
});