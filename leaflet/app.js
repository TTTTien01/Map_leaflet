L.mapquest.key = 'BfEybqCaK3WqiqfVYZNGYPjuHHVIHuxS';

const namCanThoUniversityCoor = [10.0079465, 105.7206429];
let directionRoute;

// khởi tạo map
let map = L.mapquest.map('map', {
  center: namCanThoUniversityCoor,
  layers: L.mapquest.tileLayer('map'),
  zoom: 13,
});

// chuyển tọa độ thành địa chỉ và gán vào input khi click vào map
var geocodeService = L.esri.Geocoding.geocodeService({
  apikey:
    'AAPK025b6f6a31764374b2092c0ba9737ed1i3Oo3ZxnfhP_XGKKaB1USotbD72vccSJT5wevrCio5Fjged94wB508k3se0mzFyO',
});

let isStart = true;
let markersArray = [];
const reverseGeocode = (e) => {
  const latlng = JSON.stringify(e.latlng);

  markersArray.push(
    L.mapquest.textMarker([e.latlng.lat, e.latlng.lng], {
      // text: `[${e.latlng.lng}, ${e.latlng.lat}]`,
      position: 'right',
      type: 'marker',
      icon: {
        primaryColor: '#111111',
        secondaryColor: isStart ? '#339933' : '#990000',
        size: 'sm',
      },
    })
  );

  geocodeService
    .reverse()
    .latlng(e.latlng)
    .run(function (error, result) {
      const displayAddress = `${result.address.Match_addr}`;
      if (!directionRoute) {
        // nếu chưa có đủ 2 marker
        if (isStart) {
          // nếu đã có 2 marker
          if (markersArray.length > 2) {
            markersArray[0].remove();
            markersArray[0] = markersArray[2];
            markersArray = markersArray.slice(0, 2);
          }

          // thêm marker
          markersArray[0].addTo(map);

          document.getElementById('start').value = displayAddress;
          document.getElementById('start').dataset.latlng = latlng;
        } else {
          // nếu đã có 2 marker
          if (markersArray.length > 2) {
            markersArray[1].remove();
            markersArray[1] = markersArray[2];
            markersArray = markersArray.slice(0, 2);
          }
          // thêm marker
          markersArray[1].addTo(map);

          document.getElementById('destination').value = displayAddress;
          document.getElementById('destination').dataset.latlng = latlng;
        }
      }

      isStart = !isStart;
    });
};

map.on('click', reverseGeocode);

// gán sự kiện submit cho form khi gửi điểm đầu và điểm đến đi
document.getElementById('directionBtn').addEventListener('click', (e) => {
  e.preventDefault();

  const start = JSON.parse(
    document.getElementById('start').dataset?.latlng || null
  );
  const end = JSON.parse(
    document.getElementById('destination').dataset?.latlng || null
  );

  if (start === null || end === null) return;

  const startCoor = `[Kinh độ: ${start.lng}, vĩ độ: ${start.lat}]`;
  const endCoor = `[Kinh độ: ${end.lng}, vĩ độ: ${end.lat}]`;

  // xóa direction route cũ
  if (directionRoute) {
    directionRoute.remove();
  }

  // xóa các marker cũ
  if (markersArray) {
    markersArray.forEach((item) => item.remove());
  }

  const directions = L.mapquest.directions();

  directions.route(
    {
      start,
      end,
      options: {
        maxRoutes: 3, // hiển thị tối đa 3 đường đi khác nhau
        unit: 'k', // đơn vị khoảng cách là kilomet
      },
    },
    (error, response) => {
      const startAddress = document
        .getElementById('start')
        .value.split(' (')[0];
      const endAddress = document
        .getElementById('destination')
        .value.split(' (')[0];

      if (response?.info.statuscode === 0) {
        const distance = response.route.distance;
        const time = formattedTimeToText(response.route.formattedTime);

        document.querySelector('.result-container').innerHTML = `
          <h4>THÔNG TIN ĐƯỜNG ĐI NGẮN NHẤT</h4>
          <p><b>BẮT ĐẦU 🎌: </b> ${startAddress} <br /> ${startCoor}</p>
          <p><b>KẾT THÚC 🚩: </b> ${endAddress} <br /> ${endCoor}</p>
          <p><b>TRẠNG THÁI 🪲: </b> OK</p>
          <p><b>KHOẢNG CÁCH 🛣️: </b> ${distance} km</p>
          <p><b>THỜI GIAN ⏱️: </b> ${time}</p>
        `;
      } else {
        document.querySelector('.result-container').innerHTML = `
          <h4>THÔNG TIN ĐƯỜNG ĐI NGẮN NHẤT</h4>
          <p><b>BẮT ĐẦU: </b> ${startAddress} ${startCoor}</p>
          <p><b>KẾT THÚC: </b> ${endAddress} ${endCoor}</p>
          <p><b>TRẠNG THÁI: </b> Không tìm được đường đi 🙁🙁</p>
        `;
      }

      document.querySelector('.result-container').style.display = 'block';

      // Hiển đi đường đi
      directionRoute = L.mapquest
        .directionsLayer({
          directionsResponse: response,
        })
        .addTo(map);
    }
  );
});

// Xóa direction cũ
document
  .getElementById('deleteDirectionsBtn')
  .addEventListener('click', (e) => {
    e.preventDefault();

    if (directionRoute) {
      directionRoute.remove();
      directionRoute = null;
    }
  });

// Hàm chuyển phút sang định dạng HH:MM:SS
function formattedTimeToText(formattedTime) {
  let result = '';
  const hour = +formattedTime.split(':')[0];
  const minute = +formattedTime.split(':')[1];
  const second = +formattedTime.split(':')[2];

  if (hour > 0) {
    result = `${hour} giờ ${minute} phút ${second} giây`;
  } else if (minute > 0) {
    result = `${minute} phút ${second} giây`;
  } else {
    result = `${second} giây`;
  }

  return result;
}
