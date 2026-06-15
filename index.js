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