let input=document.getElementById("city");
let list=document.getElementById("options");
input.oninput=async()=>{
    if(input.value.length< 2) return;
    const res = await fetch(`/api/search?q=${input.value}`);
    let data=await res.json();
    console.log(data.map(p => p.display_name.split(',').pop().trim()));
    list.innerHTML = `
        <option value="" disabled selected>Select a location...</option>
        ${data.map(p => `<option value="${p.display_name}">${p.display_name}</option>`).join('')}
    `;
}
list.onchange = () => {
    if (!list.value) return;
    input.value = list.value;
    const lastpart = list.value.split(',').pop();
    console.log("Selected Location:", lastpart.trim());
};