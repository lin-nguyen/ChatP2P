
// MAIN_THREAD_CREATE
$('#sign-up-action-click').click((event) => {
    const bool = $(this).attr('display');
    if (bool === 'false') {
        $(this).attr('display', 'true');
        $('#signin-form-id').show();
        $('#info-form-id').hide();
    }
    else {
        $(this).attr('display', 'false');
        $('#signin-form-id').hide();
        $('#info-form-id').show();
    }
})

var b1 = false, b2 = false, b3 = false;

function Alert() {
    if (b1 && b2 && b3) {
        $('.alertUl').hide();
    }
    else {
        $('.alertUl').show();
    }
}

$('#user-sign-up-id').on('input', function () {
    if ($(this).val().length == 0) {
        b1 = false;
        $('#user-alert').text('Your username needs at least 1');
        $('#user-alert').show();
    }
    else {
        $.ajax({
            type: 'POST',
            url: '/username-check',
            data: { data: $(this).val() }
        }).done((data) => {
            if (!data) {
                b1 = false;
                $('#user-alert').show();
                $('#user-alert').text('Your username is not available');
            }
            else {
                b1 = true;
                $('#user-alert').hide();
            }
        })
    }
    Alert()
})

$('#paw-sign-up-id').on('input', function () {
    if ($(this).val().length < 6) {
        $('#paw-alert').show();
        b2 = false;
    }
    else {
        $('#paw-alert').hide();
        b2 = true;
    }
    Alert()
})

$('#fname-sign-up-id').on('input', function () {
    if ($(this).val().length == 0) {
        $('#fname-alert').show();
        b3 = false;
    }
    else {
        $('#fname-alert').hide();
        $('.output-name-display').text($(this).val())
        b3 = true;
    }
    Alert()
})

$('#avatar-sign-up-id').change((event) => {
    $('#user-image-id').attr('src', URL.createObjectURL(event.target.files[0]))
})

$('#btn-sign-action-id').click(event => {
    if (b1 && b2 && b3) {
        const jsonAccount = {
            username: $('#user-sign-up-id').val(),
            password: $('#paw-sign-up-id').val(),
            fullname: $('#fname-sign-up-id').val(),
        }
        $.ajax({
            type: 'POST',
            url: '/create-Account',
            data: jsonAccount
        }).done(call => {
            if (call.bool) {
                var file = $('#avatar-sign-up-id')[0].files[0]
                if (file != undefined) {
                    var formData = new FormData()
                    files = file.name.split('.')
                    files = (call.id + "." + files[1])
                    formData.append('avatar', file, files);
                    $.ajax({
                        type: 'POST',
                        data: formData,
                        url: '/avatar-new-account',
                        processData: false,
                        crossDomain: true,
                        contentType: false
                    }).done(call2 => {
                        newSignCall(call.id)
                    })
                }
                else {
                    $.ajax({
                        type: 'POST',
                        data: { id: call.id },
                        url: '/avatar-default'
                    }).done(call2 => {
                        newSignCall(call.id)
                    })
                }
            }
        })
    }
})

$('#user-ip-id-get').on('input', function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') $("#log-action-id-send").click();
})
$('#ps-ip-id-get').on('input', function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') $("#log-action-id-send").click();
})

$("#log-action-id-send").click(event => {
    $.ajax({
        url: "/login-request",
        type: "POST",
        data: {
            username: $('#user-ip-id-get').val().trim(),
            password: $('#ps-ip-id-get').val().trim()
        }
    }).done((boo) => {
        if (boo.bool) {
            $('.LOGIN-SIGNUP').hide();
            emitNewUser(boo.ID, boo.name);
        }
        else {
            window.location.reload();
        }
    })
})

// -------------------HANDING FRONT-END---------------------
$('#close-search-interaction').click(event => {
    if (peerObj.numBoxChat != 0) {
        $('#account-status-req-id').hide()
    }
})
$('#online-control-id').click(event => {
    if ($('#online-control-id').attr('online') == 'true') {
        $('.fa-globe-americas').css('color', '#a6a5a4')
        $('#online-control-id').attr('online', 'false');
        $('#input-id-search-box').attr('placeholder', 'Search user offline')
        $('.list-online-div-showing').hide();
        $('.list-offline-div-showing').show();
    }
    else {
        $('.fa-globe-americas').css('color', 'green')
        $('#online-control-id').attr('online', 'true')
        $('#input-id-search-box').attr('placeholder', 'Search user online')
        $('.list-online-div-showing').show();
        $('.list-offline-div-showing').hide();
    }
})
$('#input-id-search-box').on('input', function (event) {
    if ($('#online-control-id').attr('online') == 'true') {
        $(`#list-online-ul-s-id span:not(:contains('${$(this).val()}'))`).parent().css('display', 'none')
        $(`#list-online-ul-s-id span:contains('${$(this).val()}')`).parent().css('display', 'flex')
    }
    else {
        $(`#list-offline-ul-s-id span:not(:contains('${$(this).val()}'))`).parent().css('display', 'none')
        $(`#list-offline-ul-s-id span:contains('${$(this).val()}')`).parent().css('display', 'flex')
    }
})
$('#add-new-box-msg').click(event => {
    $('#account-status-req-id').show()
})



////////////------------------------------------------PEER-------------------------------------------------------
const socket = io('localhost:5000');
var peer = new Peer();
// const socket = io('https://shareantbox.herokuapp.com/')
// const customConfig = {
//     iceServers: [{   urls: [ "stun:ss-turn2.xirsys.com" ]}, {   username: "MjO-Nz29xCsnlhuCxMHliyx7pDHAna4I911U9kPUWb9e0vLvqKjg9f_0N12IiQofAAAAAF2wZq9idWlsb25n",   credential: "3fde531e-f5a3-11e9-84a8-322c48b34491",   urls: [       "turn:ss-turn2.xirsys.com:80?transport=udp",       "turn:ss-turn2.xirsys.com:3478?transport=udp",       "turn:ss-turn2.xirsys.com:80?transport=tcp",       "turn:ss-turn2.xirsys.com:3478?transport=tcp",       "turns:ss-turn2.xirsys.com:443?transport=tcp",       "turns:ss-turn2.xirsys.com:5349?transport=tcp"   ]}]
// }


// const peer = new Peer({
//     key: 'peerjs',
//     host: 'peer-server-call.herokuapp.com',
//     secure: true,
//     port: 443,
//     config: customConfig
// });

peer.on('open', id => {
    peerObj.IP = id;
})
var peerObj = {
    IP: "peerIP",
    Name: "peerName",
    ID: "peerID",
    nowBoxChat: "root",
    peerVidState: false,
    nowBoxChatNum: 0,
    numBoxChat: 0,
    nowFistBox: "root",
    listBoxChat: []
}
var tempRoom = { rLID: [], rLIP: [], rLName: [] }

peer.on("connection", conn => {
    conn.on('data', Obj => {
        if (Obj.action == "openBoxChat") {
            createBoxChat(Obj);
        }
        else if (Obj.action == "removeBoxChat") {
            removeBoxChat(Obj);
        }
        else if (Obj.action == "sendMessageText") {
            renderTextMessage(Obj, false);
        }
        else if (Obj.action == "sendMsgImg") {
            renderImgMessage(Obj);
        }
        else if (Obj.action == "createVideoBox") {
            appendVideoBtn(Obj, false)
        }
        else if (Obj.action == "removeVideoBox") {
            removeVideoBtn(Obj.ID);
        }

    })
})

// --------------------------LOGIN REQUEST-------------------------

function emitNewUser(ID, name) {
    peerObj.ID = ID;
    peerObj.Name = name;
    socket.emit('newPeerOnline', { IP: peerObj.IP, username: $('#user-ip-id-get').val().trim() })
    $('#user-ip-id-get').val('')
    $('#ps-ip-id-get').val('')
}

function newSignCall(data) {
    socket.emit('newSignOffline', {
        ID: data,
        user: $('#user-sign-up-id').val().trim(),
        fname: $('#fname-sign-up-id').val().trim()
    });
    $('#user-sign-up-id').val('')
    $('#fname-sign-up-id').val('')
    window.location.reload()
}

// Append list box using
$('#list-online-ul-s-id').on('click', 'li', function (event) {
    if ($(this).attr('check') == "false") {
        $(this).attr('check', "true");
        $(this).css('background-color', 'lightgray')
        const lst = $(this).attr('data').split(',');
        const IP = $(this).attr('IP');
        tempRoom.rLIP.push(IP);
        tempRoom.rLName.push(lst[0]);
        tempRoom.rLID.push(lst[1]);
        $('#add-avt-id-options').append(`
        <img ip = "${IP}" src="${$("img", this).attr('src')}"" ></img>
        `)
        $('.chat-with-showing-user').css('visibility', 'visible')
    }
    else {
        $(this).attr('check', "false");
        $(this).css('background-color', 'transparent');
        const IP = $(this).attr('IP');
        const index = tempRoom.rLIP.findIndex(e => e.IP === IP);
        tempRoom.rLID.splice(index, 1);
        tempRoom.rLName.splice(index, 1);
        tempRoom.rLIP.splice(index, 1);
        $(`#add-avt-id-options [ip = "${IP}"]`).remove();
        var count = $("#add-avt-id-options > *").length;
        if (count == 0)
            $('.chat-with-showing-user').css('visibility', 'hidden')
    }
})
// ------------------------------------------------------SOCKET--------------------------------------------
//--------------------------- LIST ONLINE, LIST OFFLINE-----------------------------
socket.on('listOn-Off', list => {
    const listImage = []
    list.listOn.forEach(e => {
        listImage.push(e.ID)
    });
    list.listOff.forEach(e => {
        listImage.push(e.ID)
    })
    const onlineL = list.listOn.length, offlineL = list.listOff.length;
    socket.emit('get-images-buffer', { list: listImage, state: "la" })

    socket.on('list-avatar-buffer-la', listImage => {
        for (var i = 0; i < onlineL; i++) {
            $('#list-online-ul-s-id').append(`
                <li class="list-online-li-style" check = "false" data="${list.listOn[i].fullname},${list.listOn[i].ID}" IP="${list.listOn[i].IP}">
                    <img class="img-status-options" src="${"data:image/png;base64," + listImage[i]}" alt="Nothing">
                    <span class="l-o-s-u">${list.listOn[i].fullname}</span>
                    <i class="fas fa-circle fa-online"></i>
                </li>`)
        }
        listImage.splice(0, onlineL)
        for (var i = 0; i < offlineL; i++) {
            var li = $(`<li class="list-offline-li-style" IP="${list.listOff[i].ID}"></li>`).html(`
                <img class="img-status-options" src="${"data:image/png;base64," + listImage[i]}" alt="Nothing">
                <span class="l-o-s-u">${list.listOff[i].fullname}</span>
                <i class="fas fa-circle fa-offline"></i>`)
            $('#list-offline-ul-s-id').append(li)
        }
    })
    socket.on('new-online-user', account => {
        $(`#list-offline-ul-s-id [IP="${account.ID}"]`).remove()
        $('#list-online-ul-s-id').append(`
            <li class="list-online-li-style" check = "false" data="${account.fullname},${account.ID}" IP="${account.IP}">
                <img class="img-status-options" src="data:image/png;base64,${account.src}" alt="Nothing">
                <span class="l-o-s-u">${account.fullname}</span>
                <i class="fas fa-circle fa-online"></i>
            </li>`)
    })
    socket.on('new-offline-user', account => {
        $('#list-offline-ul-s-id').append(`
        <li class="list-offline-li-style"  IP="${account.ID}">
            <img class="img-status-options" src="data:image/png;base64,${account.src}" alt="Nothing">
            <span class="l-o-s-u">${account.fullname}</span>
            <i class="fas fa-circle fa-offline"></i>
        </li>`)
    })
    socket.on('user-out-app', IP => {
        const src = $(`#list-online-ul-s-id [IP="${IP.IP}"] img`).attr('src')
        $(`#list-online-ul-s-id [IP="${IP.IP}"]`).remove()
        $('#list-offline-ul-s-id').append(`
            <li class="list-offline-li-style"  IP="${IP.data.ID}">
                <img class="img-status-options" src="${src}" alt="Nothing">
                <span class="l-o-s-u">${IP.data.fullname}</span>
                <i class="fas fa-circle fa-offline"></i>
            </li>`)
    })
})

// BOX-CHAT------------------------------------------------------------

function swapNewBox(Obj) {
    // const nowF = peerObj.nowFistBox;
    $(`#${peerObj.nowFistBox}`).before($(`#${Obj}`))
}

function checkExist(List, tList) {
    var returnCheck = "";
    List.forEach(e => {
        if (e.rLIP.length == tList.length) {
            var tCheck = true;
            e.rLIP.forEach(t => {
                if (!tList.includes(t)) tCheck = false;
            })
            if (tCheck) returnCheck = e.rID;
        }
    })
    return returnCheck;
}

// CREATE BOX CHAT --------------------------------
$('#submit-request-bc-id').click(event => {
    var room = tempRoom;
    const returnV = checkExist(peerObj.listBoxChat, [peerObj.IP].concat(room.rLIP))
    if (returnV == "") {
        let roomID = Math.random().toString(36).substring(7);
        room.rID = roomID;
        OpenBoxChat(room);
        // peerObj.listBoxChat.push(room);
        peerObj.nowBoxChatNum = peerObj.numBoxChat - 1;
    }
    else {
        $(`#now-msg-show-stt [rID = ${returnV}`).click()
    }
    $(`#add-avt-id-options`).html('');
    $('.chat-with-showing-user').css('visibility', 'hidden');
    $('#list-online-ul-s-id li').css('background-color', "transparent");
    $('#list-online-ul-s-id li').attr('check', 'false')
    $('#account-status-req-id').hide()
    tempRoom = { rLID: [], rLIP: [], rLName: [] };
})

function OpenBoxChat(Obj) {
    const IP = peerObj.IP
    const checkExist = Obj.rLIP.some(e => e == IP)
    if (!checkExist) {
        Obj.rLName = [peerObj.Name.toString()].concat(Obj.rLName);
        Obj.rLIP = [peerObj.IP.toString()].concat(Obj.rLIP);
        Obj.rLID = [peerObj.ID.toString()].concat(Obj.rLID);
    }
    const length = Obj.rLName.length;
    for (var i = 0; i < length; i++) {
        const conn = peer.connect(Obj.rLIP[i])
        conn.on('open', function () {
            conn.send({ action: "openBoxChat", rID: Obj.rID, rLIP: Obj.rLIP, rLID: Obj.rLID, rLName: Obj.rLName });
        })
    }
    createBoxChat(Obj)
}

function createBoxChat(Obj) {
    updateListMessage(Obj)
    boxShowing(Obj.rID)
    peerObj.listBoxChat.push({ rID: Obj.rID, rLName: Obj.rLName, rLID: Obj.rLID, rLIP: Obj.rLIP })

    updateNowboxChat(Obj);
    $('#msg-area-body-id').append(`
        <ul class="message-area-ul-show" id="msg-area-ul-s-id" rID =${Obj.rID}>
        </ul>
    `)
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).prependTo('#now-msg-show-stt')
    // swapNewBox(Obj.rID)
    // peerObj.nowFistBox = Obj.rID;
    peerObj.numBoxChat++;
}

function updateListMessage(Obj) {
    socket.emit("get-images-buffer", { list: Obj.rLID, state: Obj.rID })
    var pImage = "";
    socket.on('list-avatar-buffer-' + Obj.rID, listImage => {
        const lst = Obj.rLIP;
        var i = 0;
        listImage.forEach(e => {
            pImage += `<img src="data:image/png;base64,${e}" root="${lst[i]}" alt="">`;
            i++;
        })
        $('#now-msg-show-stt').prepend(`
            <li rID="${Obj.rID}">
                        <p>${Obj.rLName.join(', ')}</p>
                        <br>
                        <p>${pImage}</p>
                    </li>`)
        $(`#now-msg-show-stt [rID = "${Obj.rID}"]`).css('background-color', 'lightgray')
        $(`#now-msg-show-stt [rID = "${Obj.rID}"]`).css('border', 'solid 1px green')
        $('#group-avt-s-id').html(`${pImage}`)
    })
}

function boxShowing(ID) {
    $(`#msg-area-body-id [rID = "${peerObj.nowBoxChat}"]`).hide()
    $(`#msg-area-body-id [rID = "${ID}"]`).show()
    $(`#now-msg-show-stt [rID = "${peerObj.nowBoxChat}"]`).css('background-color', 'transparent')
    $(`#now-msg-show-stt [rID = "${peerObj.nowBoxChat}"]`).css('border', 'none')
    $(`#now-msg-show-stt [rID = "${ID}"]`).css('background-color', 'lightgray')
    $(`#now-msg-show-stt [rID = "${ID}"]`).css('border', 'solid 1px green')
    peerObj.nowBoxChat = ID;
}

function updateNowboxChat(Obj) {
    $('#msg-box-h-out').attr('rID', peerObj.nowBoxChat);
    $('#msg-are-head #msg-box-h-mem').html(`
    <i class="fas fa-users"></i>
    <p>${Obj.rLName.join(', ')}</p>
    `);
    $('#file-image-transfer').attr('rID', peerObj.nowBoxChat);
    $('#videoc-tranf-inte').attr('rID', peerObj.nowBoxChat);
    $('#btn-send-msg-id').attr('rID', peerObj.nowBoxChat);

    const stt = Math.random().toString(36).substring(7);
    socket.emit("get-images-buffer", { list: Obj.rLID, state: stt })
    var pImage = "";
    socket.on('list-avatar-buffer-' + stt, listImage => {
        const lst = Obj.rLIP;
        var i = 0;
        listImage.forEach(e => {
            pImage += `<img src="data:image/png;base64,${e}" alt="">`;
            i++;
        })
        $('#group-avt-s-id').html(`${pImage}`)
    })
}



// CHANGE GROUP CHAT-----------------------------------------------
$('#now-msg-show-stt').on('click', 'li', function () {
    const roomID = $(this).attr('rID');
    const index = peerObj.listBoxChat.findIndex(e => e.rID == roomID)
    changeGroupChat(peerObj.listBoxChat[index])
    peerObj.nowBoxChatNum = index;
})

function changeGroupChat(Obj) {
    boxShowing(Obj.rID)
    updateNowboxChat(Obj)
}

// SEND TEXT MESSAGE ---------------------------------------------------
$('#input-send-msg-id').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        $('#btn-send-msg-id').click()
    }
});

$('#btn-send-msg-id').click(event => {
    const text = $('#input-send-msg-id').val().trim();
    if (text != "") {
        const index = peerObj.nowBoxChatNum;
        $('#input-send-msg-id').val('');
        const listIP = peerObj.listBoxChat[index].rLIP;
        const Obj = { action: "sendMessageText", rID: peerObj.nowBoxChat, sourceName: peerObj.Name, sourceID: peerObj.ID, sourceText: text };
        listIP.forEach(e => {
            const conn = peer.connect(e);
            conn.on('open', () => {
                conn.send(Obj)
            })
        })
        renderTextMessage(Obj, true)
    }
})
function renderTextMessage(Obj, bool) {
    const stt = Math.random().toString(36).substring(7);
    socket.emit("get-images-buffer", { list: [Obj.sourceID], state: stt })
    const extens = ((bool) ? "host" : "guest")
    socket.on('list-avatar-buffer-' + stt, img => {
        $(`#msg-area-body-id [rID=${Obj.rID}]`).append(`
        <li class="message-${extens}" dir="${((bool) ? "rtl" : "ltr")}">
            <p class="${extens}-name-inside">${Obj.sourceName}</p> 
            <p class="msg-show">
                <img class="avatar-img" src="data:image/png;base64,${img}" alt="">
                <span class="msg-text">${Obj.sourceText}</span> 
                </p>
        </li>
        <div class="clearfix"></div>`)
        $(`#msg-area-body-id [rID = ${Obj.rID}]`).scrollTop($(`#msg-area-body-id [rID = ${Obj.rID}]`).prop('scrollHeight'))
        $(`#now-msg-show-stt [rID = ${Obj.rID}]`).css('background-color', '#e3e3e3')
    })
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).prependTo('#now-msg-show-stt')
    // swapNewBox(Obj.rID)
    // peerObj.nowFistBox = Obj.rID;
}

// SEND IMAGE MESSAGE--------------------------------------------------------
$('#file-image-transfer').on("change", function (event) {
    const blob = new Blob(event.target.files)
    const roomID = $(this).attr('rID');
    const ListIP = peerObj.listBoxChat[peerObj.nowBoxChatNum].rLIP;
    const Obj = { action: "sendMsgImg", Name: peerObj.Name, ID: peerObj.ID, rID: roomID, image: blob }
    ListIP.forEach(e => {
        const conn = peer.connect(e);
        conn.on('open', () => {
            conn.send(Obj)
        })
    })
    const stt = Math.random().toString(36).substring(7);
    socket.emit("get-images-buffer", { list: [Obj.ID], state: stt })
    socket.on('list-avatar-buffer-' + stt, img => {
        $(`#msg-area-body-id [rID=${Obj.rID}]`).append(`
        <li class="message-host" dir="rtl">
            <p class="host-name-inside">${Obj.Name}</p> 
            <p class="msg-show">
                <img class="avatar-img" src="data:image/png;base64,${img}" alt="">
                <img class="msg-img" src="${URL.createObjectURL(event.target.files[0])}" alt="">
                </p>
        </li>
        <div class="clearfix"></div>`)
    })
    // swapNewBox(Obj.rID)
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).prependTo('#now-msg-show-stt')
    // peerObj.nowFistBox = Obj.rID;
    $(`#msg-area-body-id [rID = ${Obj.rID}]`).scrollTop($(`#msg-area-body-id [rID = ${Obj.rID}]`).prop('scrollHeight'))
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).css('background-color', '#e3e3e3')
})

function renderImgMessage(Obj) {
    const bytes = new Uint8Array(Obj.image)
    const stt = Math.random().toString(36).substring(7);
    socket.emit("get-images-buffer", { list: [Obj.ID], state: stt })
    socket.on('list-avatar-buffer-' + stt, img => {
        $(`#msg-area-body-id [rID=${Obj.rID}]`).append(`
        <li class="message-guest" dir="ltr">
            <p class="guest-name-inside">${Obj.Name}</p> 
            <p class="msg-show">
                <img class="avatar-img" src="data:image/png;base64,${img}" alt="">
                <img class="msg-img" src="data:image/png;base64,${encode(bytes)}" alt="">
                </p>
        </li>
        <div class="clearfix"></div>`)
    })
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).prependTo('#now-msg-show-stt')
    // swapNewBox(Obj.rID)
    // peerObj.nowFistBox = Obj.rID;
    $(`#msg-area-body-id [rID = ${Obj.rID}]`).scrollTop($(`#msg-area-body-id [rID = ${Obj.rID}]`).prop('scrollHeight'))
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).css('background-color', '#e3e3e3')
}

$('#msg-area-body-id').on('click', 'img', function () {
    $('#divImageShowing').show()
    var btn = $('<p id="btnOnR" class="btnCloseImage" style="position:fixed;" onclick="closed()"><i class="fas fa-compress-arrows-alt"></i></p>')
    var miniDiv = $(`<div class="miniDiv" style="position:fixed;" ><img id="imgonR" class="resizeImg"  style="cursor:pointer" src = ${$(this).attr('src')} ></img></div>`)
    var div = $('<div id = "idImageShow" style="position:fixed;" class="ImageShow"></div>')
    $('#divImageShowing').append(div, miniDiv, btn)
})

function closed() {
    $('.miniDiv').remove()
    $('#btnOnR').remove()
    $('#idImageShow').remove()
    $('#divImageShowing').hide()
}

function encode(input) {
    const keyStr =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    let output = ''
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4
    let i = 0

    while (i < input.length) {
        chr1 = input[i++]
        chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
        chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

        enc1 = chr1 >> 2
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        enc4 = chr3 & 63

        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        }
        output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4)
    }
    return output
}



// SEND IMAGE MESSAGE--------------------------------------------------------

function openStream() {
    const config = { audio: true, video: true }
    return navigator.mediaDevices.getUserMedia(config)
}

function setStream(idVideo, stream) {
    var tagStream = document.getElementById(idVideo)
    try {
        tagStream.srcObject = stream;
    } catch (error) {
        tagStream.src = URL.createObjectURL(stream);
    }
}


$('#videoc-tranf-inte').click(event => {
    const listIP = peerObj.listBoxChat[peerObj.nowBoxChatNum].rLIP;
    listIP.forEach(id => {
        if (id != peerObj.IP) {
            peerObj.peerVidState = true;
            const conn = peer.connect(id);
            conn.on('open', () => conn.send({
                action: "createVideoBox",
                listIP: listIP,
                Name: peerObj.Name,
                ID: peerObj.ID,
                rID: peerObj.nowBoxChat
            }))
        }
    })
    appendVideoBtn({
        listIP: listIP,
        Name: peerObj.Name,
        ID: peerObj.ID,
        rID: peerObj.nowBoxChat
    }, true)
})

function appendVideoBtn(Obj, bool) {
    const stt = Math.random().toString(36).substring(7);
    socket.emit("get-images-buffer", { list: [Obj.ID], state: stt })
    const extens = ((bool) ? "host" : "guest")
    socket.on('list-avatar-buffer-' + stt, img => {
        $(`#msg-area-body-id [rID=${Obj.rID}]`).append(`
        <li class="message-${extens}" dir="${((bool) ? "rtl" : "ltr")}">
            <p class="${extens}-name-inside">${Obj.Name}</p> 
            <p class="msg-show">
                <img class="avatar-img" src="data:image/png;base64,${img}" alt="">
                <button class="msg-vid">Video Call</button>
                </p>
        </li>
        <div class="clearfix"></div>`)
        $(`#msg-area-body-id [rID = ${Obj.rID}]`).scrollTop($(`#msg-area-body-id [rID = ${Obj.rID}]`).prop('scrollHeight'))
        $(`#now-msg-show-stt [rID = ${Obj.rID}]`).css('background-color', '#e3e3e3')
    })
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).prependTo('#now-msg-show-stt')
    // swapNewBox(Obj.rID)
    // peerObj.nowFistBox = Obj.rID;
    $("#divVideoShowing").attr('mem_count', '1')
}


$('#msg-area-body-id').on('click', 'button', function () {
    const mem_inside = $('#divVideoShowing').attr('mem_count');
    if (mem_inside == 0) {
        alert("Video call has been ended~")
    }
    else {
        $('#div-call-contains').show()

        // SHOW VIDEO CONTAINS HTML HERE

        openStream().then(stream => {
            const thisIPSUB = peerObj.IP.substring(0, 9)
            const divStream = $(`<video muted autoplay id="${thisIPSUB}" class = "streamvideo" ></video>`);
            $('#divVideoShowing').append(divStream);
            setStream(thisIPSUB, stream);
            const listIP = peerObj.listBoxChat[peerObj.nowBoxChatNum].rLIP;
            peerObj.peerVidState = true;
            listIP.forEach(e => {
                if (e != peerObj.IP) {
                    const conn = peer.call(e, stream);
                    conn.on('stream', remoteStream => {
                        var bool = true;
                        if (bool) {
                            bool = false;
                            const IP = conn.peer.substring(0, 9);
                            var divStream = $(`<video autoplay id="${IP}" class = "streamvideo" ></video>`)
                            $('#divVideoShowing').append(divStream)
                            setStream(IP, remoteStream)
                            $("#divVideoShowing").attr('mem_count', parseInt($("#divVideoShowing").attr('mem_count')) + 1)
                        }
                        else {
                            bool = true;
                        }
                    })
                }
            })
        })
    }
})

peer.on('call', call => {
    if (peerObj.peerVidState) {
        openStream().then(stream => {
            call.answer(stream);
            var bool = true;
            call.on('stream', remoteStream => {
                if (bool) {
                    const IP = call.peer.substring(0, 9);
                    if ($(`#divVideoShowing #${IP}`).length == 0 && peerObj.peerVidState) {
                        bool = false;
                        const divStream = $(`<video autoplay id="${IP}" class = "streamvideo" ></video>`);
                        $('#divVideoShowing').append(divStream);
                        setStream(IP, remoteStream);
                        $("#divVideoShowing").attr('mem_count', parseInt($("#divVideoShowing").attr('mem_count')) + 1)

                    }
                }
                else {
                    bool = false;
                }
            })
        })
    }
})

$('#closedNowVideoCall').click(() => {
    peerObj.peerVidState = false;
    const listIP = peerObj.listBoxChat[peerObj.nowBoxChatNum].rLIP;
    listIP.forEach(e => {
        const conn = peer.connect(e);
        conn.on('open', () => {
            conn.send({ action: "removeVideoBox", ID: peerObj.IP })
        })
    })
    let stream = document.getElementById(peerObj.IP.substring(0, 9)).srcObject;
    let tracks = stream.getTracks();
    tracks.forEach(function (track) {
        track.stop();
    });
    document.getElementById(peerObj.IP.substring(0, 9)).srcObject = null;
    $('#div-call-contains').hide()
    // $("#divVideoShowing").hide()
    $("#divVideoShowing video").remove()
    $("#divVideoShowing").attr('mem_count', '1');
    removeVideoBtn(peerObj.IP);
}
)

function removeVideoBtn(ID) {
    $(`#divVideoShowing [id=${ID.substring(0, 9)}]`).remove()
    $("#divVideoShowing").attr('mem_count', parseInt($("#divVideoShowing").attr('mem_count')) - 1)
}

// ----------------------------OUT GROUP CHAT--------------------------------

$('#msg-box-h-out').click(event => {
    const memIn = peerObj.listBoxChat[peerObj.nowBoxChatNum].rLIP;
    removeFromrID($('#msg-box-h-out').attr('rID'), memIn)
})

function removeFromrID(rID, MemInRoom) {
    const IP = peerObj.IP;
    const listLI = $(`#now-msg-show-stt`).find('li');//////////////////////////////
    if (listLI.length > 1) {
        listLI[1].click()
        $(`#msg-area-body-id [rID = "${rID}"]`).remove();
        $(`#now-msg-show-stt [rID = "${rID}"]`).remove();
        MemInRoom.forEach(e => {
            if (e != IP) {
                const conn = peer.connect(e);
                conn.on('open', () => {
                    conn.send({ action: "removeBoxChat", IP: IP, rID: rID });
                })
            }
        })
    }
}

function removeBoxChat(Obj) {
    console.log(Obj)
    const index = peerObj.listBoxChat.findIndex(e => e.rID == Obj.rID);
    const sIdx = peerObj.listBoxChat[index].rLIP.findIndex(e => e == Obj.IP);////////////////////////////////
    peerObj.listBoxChat[index].rLIP.splice(sIdx, 1);
    peerObj.listBoxChat[index].rLID.splice(sIdx, 1);
    peerObj.listBoxChat[index].rLName.splice(sIdx, 1);
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).find('p')[0].innerText = (peerObj.listBoxChat[index].rLName.join(', '))
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).find(`[root = ${Obj.IP}]`).remove();
    $(`#now-msg-show-stt [rID = ${Obj.rID}]`).click()
}

// --------------------------LOGOUT REQUEST------------------------

$('#id-sign-out-action').click(event => {
    console.log('ok')
    const IP = peerObj.IP;
    peerObj.listBoxChat.forEach(e => {
        e.rLIP.forEach(t => {
            if (t != IP) {
                const conn = peer.connect(t);
                conn.on('open', () => {
                    conn.send({ action: "removeBoxChat", IP: IP, rID: e.rID });
                })
            }
        })
    })
    window.location.reload();
})