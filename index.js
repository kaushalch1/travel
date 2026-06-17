let input=document.getElementById("city");
let list=document.getElementById("options");
flatpickr("#date-range", {
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
});

input.oninput=async()=>{
    if(input.value.length < 2) {
        list.innerHTML = '';
        return;
    }
    const res = await fetch(`/api/search?q=${input.value}`);
    let data=await res.json();
    list.innerHTML = data.map(p =>
        `<div class="suggestion-item" data-value="${p.display_name.split(",")[0]}">
            <p class="place">${p.display_name.split(",")[0]}</p><br><p class="country">${p.display_name.split(',').pop().trim()}</p>
        </div>`
    ).join('');
}
async function user(){
    let response = await fetch("/api/fetchtrips");
    if (!response.ok) {
        showauth(true);
        return;
    };
    let trips = await response.json();
    document.getElementById("popup").classList.add("hidden");
    document.getElementById("popup1").classList.add("hidden");
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("app-section").classList.remove("hidden");
    let mytripsContainer = document.getElementById("mytrips1");
    mytripsContainer.style.display = "flex";
    mytripsContainer.style.flexWrap = "wrap";
    mytripsContainer.style.gap = "20px";
    if(trips.length > 0){
        document.getElementById("welcome").textContent="Welcome "+trips[0].created_by;
        mytripsContainer.innerHTML = trips.map(trip => 
            `<div class="trip-card">
                <h3 style="margin-top: 0; color: #2c3e50;">${trip.title}</h3>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${trip.destination}</p>
                <p style="margin: 5px 0;"><strong>Trip Dates:</strong><br>${trip.start_date} to ${trip.end_date}</p>
                <button id="notes" onclick="pop(${trip.id},${trip.content})" style="">View notes!!</button>
            </div>`
        ).join('');
        let notes=document.getElementById("notes");
        function pop(id,content){
            document.getElementById("popup2").showModal();
            document.getElementById("note-input").value = content;
            // let response=await fetch("api/updatenotes");
            // console.log(response);
        }

        let save=document.getElementById("save");
        save.addEventListener("click",()=>{
            document.getElementById("popup2").close();
        })
    }else {
        mytripsContainer.textContent = "No trips found.";
    }
}

window.onload = user;
function showauth(islogin){
    document.getElementById("app-section").classList.add("hidden");
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("popup").classList.toggle("hidden", !isLogin);
    document.getElementById("popup1").classList.toggle("hidden", isLogin);
}
document.getElementById("show-signup").onclick = (e) => {
    e.preventDefault();
    showAuth(false);
};
document.getElementById("show-login").onclick = (e) => {
    e.preventDefault();
    showAuth(true); 
};
list.onclick = (e) => {
    const item = e.target.closest('.suggestion-item');
    if (!item) return;
    input.value = item.getAttribute('data-value');
    list.innerHTML = '';
};
let tripForm = document.querySelector("form[action='/createtrip']");
if (tripForm) {
    tripForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        let formData = new FormData(tripForm);
        let dataObject = Object.fromEntries(formData.entries());
        try {
            const response = await fetch(tripForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataObject)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            let result = await response.json();
            console.log("Trip creation successful:", result);

        } catch (error) {
            console.error("Error during form submission:", error);
        }
    });
} else {
    console.warn("Trip creation form not found. Ensure there's a form with action='/createtrip'.");
}
document.getElementById("login").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let formdata=new FormData(e.target);
    let response= await fetch("/login",{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify(
            Object.fromEntries(formdata.entries())
        )
    });
    let result=await response.json();
    // console.log(result);
    if(result.success){
        user();
    }else{
        alert(result.message);
    }
})
document.getElementById("signup").addEventListener("submit",async(e)=>{
    e.preventDefault();
    let formdata=new FormData(e.target);
    let response= await fetch("/signup",{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify(
            Object.fromEntries(formdata.entries())
        )
    });
    let result=await response.json();
    // console.log(result);
    if(result.success){
        user();
    }else{
        alert(result.message);
    }
})


// let personal=["Toothbrush","Toothpaste","Deodorant","Comb","Shampoo","Face wash"],
// utility=["Wallet","Home keys","Passport","Purse","Cash"],
// health=["Pain relievers","Vitamin","Fever tablets"],
// clothes=["Shirts/Tees","Pajamas","Pants","Shorts","Dresses"],
// accesories=["Sunglass","Hair tie","Hat"],
// electronics=["Phone","Phone charger"]
// swim=["Swimsuit","Beach towel","Sunscreen"],
// footwear=["Sandals","Shoes","Flip-Flops"];
// if(list==="packing list"){
    
// }