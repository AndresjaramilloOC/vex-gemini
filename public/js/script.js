async function enviar() {
    const input = document.getElementById('prompt');
    const mensaje = input.value;
    if (!mensaje) return;

    document.getElementById('chat').innerHTML += `<div class="mensaje"><span class="user">Tú:</span> ${mensaje}</div>`;
    input.value = '';

    const res = await fetch('http://localhost:3000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: mensaje })
    });

    const data = await res.json();
    document.getElementById('chat').innerHTML += `
    <div class="mensaje">
    <span class="bot">Vex:</span>
    <div class="respuesta">${data.response}</div>
    </div>`;
    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
}