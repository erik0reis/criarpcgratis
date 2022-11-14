var socket = io("server.pcgratis.ga:342");

var daypicker = document.getElementById('daypicker');
var timepicker = document.getElementById('timepicker');

var daypicked = undefined;
var monthpicked = undefined;
var yearpicked = undefined;

var localtimedaypicked = undefined;
var localtimemonthpicked = undefined;
var localtimeyearpicked = undefined;

var pickeddate = undefined;

function showdates(selectedindex) {
    var daybuttons = document.querySelectorAll('.daybutton');
    daybuttons.forEach(element => {
        element.remove();
    });
    for (let index = 0; index < 5; index++) {
        var element = document.createElement('button');
        element.className = "daybutton";
        if (index == selectedindex) {
            element.style = "border: 4px solid darkgreen;";
        }
        const date = new Date();
        date.setUTCDate((new Date()).getUTCDate() + index);
        element.innerHTML = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        const day = date.getDate(), month = date.getMonth(), year = date.getFullYear();
        element.addEventListener('click', () => { showdates(index); choosedate(day,month,year); });
        
        daypicker.appendChild(element);
    
        var space = document.createElement('span');
        space.innerHTML = " ";
    
        daypicker.append(space);
    }
}

showdates(-1);

function choosedate(day, month, year) {
    var date = new Date(year, month, day);
    daypicked = date.getUTCDate();
    monthpicked = date.getUTCMonth();
    yearpicked = date.getUTCFullYear();
    localtimedaypicked = date.getDate();
    localtimemonthpicked = date.getMonth();
    localtimeyearpicked = date.getFullYear();
    socket.emit('show avaliable dates', date.getDate(), date.getMonth(), date.getFullYear(), date.getTimezoneOffset());
}

function choosetime(hour, minute) {
    var date = new Date();
    date.setUTCDate(daypicked);
    date.setUTCMonth(monthpicked);
    date.setUTCFullYear(yearpicked);

    date.setHours(hour, minute, 0, 0);

    pickeddate = date;

    var enddate = new Date(date.toString());

    enddate.setUTCMinutes(enddate.getUTCMinutes() + 30);

    document.getElementById('chooseddateandtime').innerHTML = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} até ${enddate.getHours().toString().padStart(2, '0')}:${enddate.getMinutes().toString().padStart(2, '0')}`;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

document.getElementById('createpc').addEventListener('click', () => {
    socket.emit('create pc', pickeddate, document.getElementById('pcpassword').value, {os: 0});
});

function Update() {
    if (pickeddate != undefined) {
        if (document.getElementById('pcpassword').value != "") {
            document.getElementById('createpc').disabled = false;
        }else{
            document.getElementById('createpc').disabled = true;
        }
    }else{
        document.getElementById('createpc').disabled = true;
    }
    setTimeout(() => { Update(); }, 10);
}

Update();

socket.on('pc created', () => {
    window.location.href = "https://www.pcgratis.ga/pccreated.html";
})

socket.on('show avaliable dates', (datelist) => {
    var timebuttons = document.querySelectorAll('.timebutton');
    timebuttons.forEach(element => {
        element.remove();
    });
    for (let hourindex = 0; hourindex < 24; hourindex++) {
        for (let minuteindex = 0; minuteindex < 2; minuteindex++) {
            var element = document.createElement('button');
            element.className = "timebutton";
            element.style.color = "green";
            element.innerHTML = `${hourindex.toString().padStart(2, '0')}:${minuteindex == 0 ? "00" : "30"}`;
            element.addEventListener('click', () => { choosetime(hourindex, (minuteindex == 0 ? 0 : 30)) });
            timepicker.appendChild(element);

            var space = document.createElement('span');
            space.innerHTML = " ";

            timepicker.appendChild(space);
        }
    }
    var timebuttons = document.querySelectorAll('.timebutton');
    timebuttons.forEach(element => {
        var disable = true;
        datelist.forEach((date) => {
            if (date != null) {
                date = new Date(date.toString());
                if (element.innerHTML == `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` &&
                localtimedaypicked == date.getDate() && localtimemonthpicked == date.getMonth() && localtimeyearpicked == date.getFullYear()) {
                    disable = false;
                }
            }
        });
        if (disable) {
            element.style.color = "red";
            element.disabled = true;
        }else{
            element.style.color = "green";
            element.disabled = false;
        }
    });
});
