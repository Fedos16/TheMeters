let INFO_ROW = {};
let MAP;
const listIcons = {
    'Магазины табака': '🚬',
    'Парикмахерские': '✂',
    'Ремонт обуви': '👞',
    'Салоны связи': '📱',
    'Секс-шопы': '🔞',
    'Спортзалы': '🏆',
    'Стоматология' : '🦷',
    'Химчистки': '👔',
    'Аптеки': '💊',
    'Автомойки': '🚙',
    'Игровые клубы': '🎮',
    'Бассейны': '🏊',
    'Кофейни': '☕',
    'Рестораны': '🥘',
    'Магазины цветов': '🌺',
    'Кальян-бары': '🌫',
    'Продуктовые магазины': '🍏',
    'Бары': '🍻',
    'Детские сады': '👶',
    'Аптеки': '💊',
    'Кофейни': '☕',
    'Автомойки': '🚙',
    '️Бассейны': '🏊‍♂',
    'Игровые клубы': '🎮',
    'Салоны красоты': '🎀',
    'Быстрое питание': '🍟',
    'Ателье': '🧵',
    'Ветеринарные клиники': '🐩'
}

async function FalseRequest(data, status) {
    alert(data.text);
}
async function setQueryForServer(params_array, action_function) {

    let params = {}
    if ('params' in params_array) params = params_array.params;
    const url = '/api/' + params_array.url;

    let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(params)
    });
      
    let result = await response.json();
    
    if (result.ok) {
        action_function(result);
    } else {
        FalseRequest(result, 'alert' in params_array);
    }

}

function initMap(){
    // Создание карты.
    MAP = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10,
        controls: ['zoomControl']
    });
}
function showPromptRow(e) {

    // Проверка можно ли показывать элемент
    let block_cat = e.target.closest('.main__map__categories__categories');
    let name = block_cat.querySelector('.main__map__categories__categoriest__heading span').textContent;
    let objs = INFO_ROW.DetailsOrg || {};
    if (!(name in objs)) return;

    // Получение деталей по названию
    let lis = document.querySelectorAll('.buner__buner__ul');
    if (lis.length > 0) {
        let info = objs[name];
        //near, score, medium_claster_score, estimate, inhabitants
        lis[0].querySelector('b').textContent = info.score;
        lis[1].querySelector('b').textContent = info.medium_claster_score;
        lis[2].querySelector('b').textContent = info.inhabitants;
        lis[3].querySelector('b').textContent = info.near;
    }

    // Отображение элемента
    let coord = e.target.getBoundingClientRect();
    let block = document.querySelector('.buner');
    block.classList.remove('display_none');
    let coordBlock = block.getBoundingClientRect();
    let widthBlock = coordBlock.width;
    let heightBlock = coordBlock.height;

    let maxWidth = document.querySelector('.content').getBoundingClientRect().width;

    let leftPx = coord.left + coord.width / 2 - widthBlock / 2;

    let beforePx = widthBlock / 2 - 10;

    if (leftPx + widthBlock > maxWidth) {
        let distance = (leftPx + widthBlock - (maxWidth - 10));
        leftPx = leftPx - distance;
        beforePx += distance;
    } else if (leftPx < 0) {
        let distance = (Math.abs(leftPx - 10));
        leftPx = leftPx + distance;
        beforePx -= distance;
    }

    console.log(`${leftPx} + ${widthBlock} = ${leftPx + widthBlock} > ${maxWidth}`);


    document.documentElement.style.setProperty('--before-px', `${beforePx}px`);

    block.style.top = `${coord.top + window.scrollY - heightBlock-10}px`;
    block.style.left = `${leftPx}px`;

    /* if (window.innerWidth < 600) {
        if (INFO_ROW.Attempts) {
            if (INFO_ROW.Attempts < 5) {
                INFO_ROW.Attempts ++;
                showPromptRow(e);
            } else {
                INFO_ROW.Attempts = 1;
            }
        } else {
            INFO_ROW.Attempts = 1;
            showPromptRow(e);
        }
    } */

}
async function inputText(e) {
    let val = e.target.value;

    // Показываем список
    let block = document.querySelector('.map-find-block');
    if (block.classList.contains('display_none')) {
        block.classList.remove('display_none');

        let coord = e.target.getBoundingClientRect();
        let btn = document.querySelector('.main__map__find__button');
        let coord_btn = btn.getBoundingClientRect();

        e.target.style = 'border-bottom-left-radius: 0px';
        btn.style = 'border-bottom-right-radius: 0px';

        block.style.top = `${coord.top + coord.height + window.scrollY}px`;
        block.style.left = `${coord.left}px`;
        block.style.width = `${coord.width + coord_btn.width}px`;
    }

    // Если нет значения, то скрываем список
    if (!val) {
        block.classList.add('display_none');
        let inp = document.querySelector('.main__map__find__input');
        inp.style = '';
        let btn = document.querySelector('.main__map__find__button');
        btn.style = '';
    }

    if (val) await getDataForValue(val);
}

function setParamsForSearch(e) {
    let _id = e.target.id;
    INFO_ROW._id = _id;

    let text = e.target.textContent;

    document.querySelector('.main__map__find__input').value = text;
    document.querySelector('.map-find-block').classList.add('display_none');
    let inp = document.querySelector('.main__map__find__input');
    inp.style = '';
    let btn = document.querySelector('.main__map__find__button');
    btn.style = '';

    let event = new Event('click');
    document.querySelector('.main__map__find__button').dispatchEvent(event);

}
async function getDataForValue(val) {
    function action_function(data) {
        const arr = data.arr;

        let block = document.querySelector('.map-find-block ul');
        
        let code = '';
        for (let row of arr) {
            let source
            let address = row.address;
            let myAddress = address;
            let codeAddress = '';

            let startIndex = 0;

            let splitArrdess = val.split(' ');

            for (let vall of splitArrdess) {
                if (!vall) continue;
                let index = String(myAddress).toLowerCase().indexOf(String(vall).toLowerCase());
                codeAddress += `${String(address).substring(startIndex, index)}<span style="font-weight: bold; color: black;">${String(address).substring(index, index + vall.length)}</span>`;
                startIndex = index + String(vall).length;
            }
            codeAddress += String(address).substring(startIndex);
            
            code += `<li id="${row._id}">${codeAddress}</li>`;
        }

        block.innerHTML = code;

        if (arr.length == 0) {
            block.innerHTML = '<li>Ничего не найдено ...</li>';
        }

        let lis = document.querySelectorAll('.map-find-block ul li');
        if (lis.length > 0) lis.forEach(e => {
            e.removeEventListener('click', setParamsForSearch);
            if (arr.length > 0) e.addEventListener('click', setParamsForSearch);
        });

    }

    let url = 'finddata/getAddresses';
    let params = { address: val };

    // Если таймаут есть, то удаляем его
    if (INFO_ROW.Timer) clearTimeout(INFO_ROW.Timer);

    // Ограничение в 200мс для того чтобы на каджый символ не реагировал поисковик
    INFO_ROW.Timer = setTimeout(async () => {
        await setQueryForServer({ url, params }, action_function);
    }, 300)
}
function appendPointToMap(coords) {
    let myPlacemark = new ymaps.Placemark(coords, {
        hintContent: null,
        balloonContent: null,
    }, {
        // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#image',
            // Своё изображение иконки метки.
            iconImageHref: 'images/map-icon.png',
            // Размеры метки.
            iconImageSize: [30, 42],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-5, -38]
    });

    MAP.geoObjects.removeAll();
    MAP.geoObjects.add(myPlacemark);
    MAP.setBounds(MAP.geoObjects.getBounds(), { checkZoomRange: true }).then(function(){
        if(MAP.getZoom() > 15) {
            MAP.setZoom(15);
        }

    });
}
async function searchInfoForAddress(e) {
    function action_function(data) {
        
        const info = data.object;
        const listNear = {
            'Schools': 'Школа с высоким рейтингом',
            'Parks': 'Городской парк',
            'Coffees': 'Кофейни',
            'Vkusvill': 'Вкусвилл',
            'AVkusa': 'Азбука Вкуса',
            'Pool': 'Фитнес с бассейном'
        };

        appendPointToMap([info.lat, info.lng]);

        let subway = info.subway1;
        let minTil = info.min_til_subway1;
        let methodSubway = info.method_subway1;
        let strSubway = '';
        if (subway) strSubway = `м. ${subway} (${minTil} мин. ${methodSubway})`;
        document.querySelector('.main__map__address').textContent = `${info.address} ${strSubway}`;

        let infrastructure_text = 'Плохая';
        let infrastructure_score = Number(info.infrastructure_score);

        if (infrastructure_score >= 15 && infrastructure_score < 60) {
            infrastructure_text = 'Нормальная';
        } else if (infrastructure_score >= 60 && infrastructure_score < 150) {
            infrastructure_text = 'Хорошая';
        } else if (infrastructure_score >= 150) {
            infrastructure_text = 'Очень хорошая';
        }

        document.querySelector('.main__map__Infrastructure span').textContent = infrastructure_text;

        // Объекты рядом
        let strNear = info.objects_near;
        if (strNear) strNear = String(strNear).split(',');
        let arrNear = [];

        if (strNear.length > 0) {
            for (let row of strNear) {
                if (row in listNear) {
                    arrNear.push(listNear[row]);
                } else {
                    if (row) {
                        arrNear.push(row);
                    }
                }
            }
        }

        if (arrNear.length == 0) arrNear.push('-');

        document.querySelector('.main__map__nearby span').textContent = arrNear.join(', ');

        let listOrg_1 = '<div class="main__map__categories__categories__categories">';
        let listOrg_2 = '<div class="main__map__categories__categories__categories">';

        let infoOrgs = {};

        let openArr = [];

        let orgs = info.organizations;
        for (let i=0; i < orgs.length; i++) {
            let name = String(orgs[i].name).replace(/\r||\n/g, '').trim();
            let near = '';
            let score = orgs[i].score;
            let medium_claster_score = 0;
            let estimate = String(orgs[i].estimate).replace(/\r||\n/g, '').trim();;

            Object.keys(orgs[i]).map(item => {
                if (item.indexOf('near') != -1) near = orgs[i][item];
                if (item.indexOf('score') != -1) score = orgs[i][item];
                if (item.indexOf('estimate') != -1) estimate = orgs[i][item];
                if (item.indexOf('medium_cluster_score') != -1) medium_claster_score = orgs[i][item];
            });

            if (!score) estimate = 'мало данных';
            if (score == 'inf') estimate = '-';
            if (score && score != 'inf') score = Math.round(score);
            if (medium_claster_score && medium_claster_score != 'inf') medium_claster_score = Math.round(medium_claster_score);

            let inhabitants = Math.round(info.inhabitants_num);
            infoOrgs[name] = { near, score, medium_claster_score, estimate, inhabitants };

            // Определяем иконку перед текстом
            let icon = '';
            if (name in listIcons) icon = listIcons[name];

            // Определяем нужна ли подсказка
            let iconInfo = '<div class="main__map__categories__categories__info"></div>';
            if (estimate.toLowerCase() == 'мало данных' || estimate == '-') iconInfo = '';

            // Определяем цвет параметра
            let estimateClass = 'color_black';
            if (estimate.toLowerCase() == 'очень мало' || estimate.toLowerCase() == 'мало') estimateClass = 'color_green';
            if (estimate.toLowerCase() == 'очень много' || estimate.toLowerCase() == 'много') estimateClass = 'color_red';

            let code = `<div class="main__map__categories__categories">
                <div class="main__map__categories__categoriest__heading">${icon} <span>${name}</span>: <span class="${estimateClass}">${estimate}</span></div>
                ${iconInfo}
            </div>`;

            if (estimate.toLowerCase() == 'очень мало') openArr.push(name);

            (i < orgs.length / 2) ?  listOrg_1 += code : listOrg_2 += code;

        }

        if (openArr.length == 0) openArr.push('-');

        document.querySelector('.main__map__info b').textContent = openArr.join(', ');

        listOrg_1 += '</div>';
        listOrg_2 += '</div>';

        document.querySelector('.main__map__categories__categories').innerHTML = `${listOrg_1}${listOrg_2}`;

        let rows = document.querySelectorAll('.main__map__categories__categories__info');
        if (rows.length > 0) rows.forEach(e => {
            e.removeEventListener('click', showPromptRow);
            e.addEventListener('click', showPromptRow);
        });

        INFO_ROW.DetailsOrg = infoOrgs;

        document.querySelector('.map-find-block').classList.add('display_none');
        let inp = document.querySelector('.main__map__find__input');
        inp.style = '';
        let btn = document.querySelector('.main__map__find__button');
        btn.style = '';
        document.querySelector('.main__map__find__input').value = info.address;


        delete INFO_ROW._id;
    }
    let _id = INFO_ROW._id;
    let text = document.querySelector('.main__map__find__input').value;

    let url = 'finddata/getFullInfo';
    let params = { _id, text };

    await setQueryForServer({ url, params }, action_function);
}

window.onload = async () => {

    ymaps.ready(initMap);

    let inputMap = document.querySelector('.main__map__find__input');
    if (inputMap) inputMap.addEventListener('input', inputText);

    document.querySelector('body').addEventListener('mouseup', (e) => {
        if (e.which != 1) return;

        let containers = ['.buner']

        for (let i = 0; i < containers.length; i++) {
            let container = document.querySelector(containers[i]);
            if (container) {
                if (!e.target.closest(containers[i])) {
                    container.classList.add('display_none');
                }
            }
        }
    });

    let btnFind = document.querySelector('.main__map__find__button');
    if (btnFind) btnFind.addEventListener('click', searchInfoForAddress);
    
}