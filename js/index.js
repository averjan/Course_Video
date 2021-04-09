function openForm() {
    let panel = document.getElementById("chat-panel");
    panel.style.display = (panel.style.display === "flex") ? "none" : "flex"
}

document.getElementById("select-file-input").addEventListener('change', (event) => {
    file = event.target.files[0];
})

document.getElementById("send-btn").addEventListener('click', (event) =>{
    document.getElementById("select-file-input").value = '';
    shareFile()
})

