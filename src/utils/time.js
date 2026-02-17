export default function timeDate() {
    const dateH2 = document.querySelector('.date');
    const dayH1 = document.querySelector('.day');
    if (!dateH2 || !dayH1) return;

    const totalDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const totalMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const date = new Date();
    const dayName = totalDaysOfWeek[date.getDay()];
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = date.getDate();
    const month = totalMonths[date.getMonth()];
    const year = date.getFullYear();

    const hours24 = date.getHours();
    const meridian = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;

    dateH2.textContent = `${day} ${month}, ${year}`;
    dayH1.textContent = `${dayName}, ${hours12}:${minutes}:${seconds} ${meridian}`;
}
