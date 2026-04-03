export default function timeDate() {
    const timeEl = document.querySelector('#current-time');
    const dateEl = document.querySelector('#current-date');
    if (!timeEl || !dateEl) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const meridian = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;

    const dateString = `${dayName}, ${month} ${date}`;
    const timeString = `${hours12}:${minutes}:${seconds} ${meridian}`;

    timeEl.textContent = timeString;
    dateEl.textContent = dateString;
}
