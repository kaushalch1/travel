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
    console.log(result);
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
    console.log(result);
})