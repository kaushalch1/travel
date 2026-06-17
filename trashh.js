
let currentTripId = null;
async function user(){
    let response = await fetch("/api/fetchtrips");
    if (!response.ok) {
    mytripsContainer.style.flexWrap = "wrap";
    mytripsContainer.style.gap = "20px";
    if(trips.length > 0){
        document.getElementById("welcome").textContent="Welcome "+trips[0].created_by;
        mytripsContainer.innerHTML = trips.map(trip => 
            `<div class="trip-card">
            `<div class="trip-card" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; width: 250px; background: white; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #2c3e50;">${trip.title}</h3>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${trip.destination}</p>
                <p style="margin: 5px 0;"><strong>Trip Dates:</strong><br>${trip.start_date} to ${trip.end_date}</p>
                <button id="notes" style="">View notes!!</button>
                <p style="font-style: italic; font-size: 0.9em; color: #666;" id="note-preview-${trip.id}">${trip.content || 'No notes.'}</p>
                <button onclick="openNotes('${trip.id}', \`${trip.content || ''}\`)" style="cursor:pointer; background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px;">View notes!!</button>
            </div>`
        ).join('');
    } else {
        mytripsContainer.textContent = "No trips found.";
    }
}
function openNotes(id, content) {
    currentTripId = id;
    const dialog = document.getElementById("popup2");
    document.getElementById("note-input").value = content;
    dialog.showModal();
}

document.getElementById("save").addEventListener("click", async () => {
    const content = document.getElementById("note-input").value;
    const res = await fetch("/api/updatenotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentTripId, content })
    });
    const result = await res.json();
    if (result.success) {
        document.getElementById(`note-preview-${currentTripId}`).innerText = content || 'No notes.';
        document.getElementById("popup2").close();
        // Refresh trip data to ensure the 'onclick' gets the updated content
        user();
    } else {
        alert("Failed to save notes.");
    }
});