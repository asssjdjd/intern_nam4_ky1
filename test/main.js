const API_KEY = "64637f968a36414081572223251712";
const WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json";
const FORECAST_DAY = 3;
const LANGUAGE = "vi";

// khi người dùng ấn tìm kiếm theo tên.
$("#search-button").click(async () => {
  $("#message").text(``);
  let cityName = $("#input-city").val();
  console.log(cityName)
  cityName = normalizeCityName(cityName);
  console.log(cityName);
  if (cityName && cityName !== null && cityName !== "") {
    const data = await fetchWeatherData(cityName);
      $("#message").text(``);
      await displayCurrentWeather(data);
      await drawForecastChart(data,["Nhiệt độ", "Độ ẩm", "Tốc độ gió"]);

  } else {
    // Hiển thị thông báo yêu cầu nhập tên thành phố
    $("#message").text(`Vui lòng nhập tên thành phố`);
  }
});

// call api thời tiết
const fetchWeatherData = async (cityName) => {
  if (cityName === null || cityName === "") {
    throw new Error("Không có tên thành phố");
  }
  const response = await $.ajax({
    url: WEATHER_API_URL,
    type: "GET",
    data: {
      key: API_KEY,
      days: FORECAST_DAY,
      langs: LANGUAGE,
      q: cityName,
    },
  });
  return response;
};

// hiển thị thông tin về thời tiết hiện tại
const displayCurrentWeather = async (data) => {
  const currentWeather = {
    city: data.location.name,
    country: data.location.country,
    time: data.location.localtime,
    temp: data.current.temp_c,
    condition: data.current.condition.text,
    humidity: data.current.humidity,
    windSpeed: data.current.wind_kph,
  };

  $("#today-weather").text(`Thời tiết hôm nay : ${currentWeather.time.split(" ")[0].split("-").reverse().join("-")}`)
  $("#current-temp").text(`Nhiệt độ hiện tại : ${currentWeather.temp} °C`);
  $("#current-time").text(`Thời gian hiện tại : ${currentWeather.time.split(" ")[1]}`);
  $("#current-condition").text(
    `Thời tiết hiện tại : ${currentWeather.condition}`
  );
  $("#current-humidity").text(`Độ ẩm hiện tại : ${currentWeather.humidity}%`);
  $("#current-windSpeed").text(
    `Tốc độ gió  hiện tại : ${currentWeather.windSpeed}km/h`
  );
  $("#location").text(`Thành phố : ${currentWeather.city}, ${currentWeather.country}`)

//   const translateCondition = await analyzeEnglish(currentWeather.condition);
//   console.log(translateCondition);
};

// phân tích tiếng anh sang tiếng việt bằng call API
const analyzeEnglish = async (text) => {
  const GEMINI_KEY = "AIzaSyCCnib1cIXOf3IQd6apNoK1rkxd24z-iiQ";
  // Định danh chuẩn nhất hiện nay cho REST API
  const MODEL = "gemini-2.0-flash-lite";
  const URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

  const prompt = `Dịch văn bản thời tiết sau sang tiếng Việt, chỉ trả về kết quả dịch ngắn gọn: "${text}"`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 50,
    },
  };

  try {
    const response = await $.ajax({
      url: URL,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(requestBody),
    });

    if (response.candidates && response.candidates[0].content) {
      return response.candidates[0].content.parts[0].text.trim();
    }
    return text;
  } catch (error) {
    console.error(
      "Lỗi API Gemini:",
      error.responseJSON?.error?.message || error.statusText
    );
    return text;
  }
};

// vẽ biểu đồ dự đoán thời tiết các ngày tới 
async function drawForecastChart(data,lables) {
    const forecast = data.forecast.forecastday;
    console.log(forecast);
    const date = forecast.map((item)=> {
        const result = item.date.split('-').reverse();
        return result[0] + "-" + result[1]
    });
    const canvas = document.getElementsByClassName("forecast-chart");
    const temp = forecast.map(({day}) => day.avgtemp_c);
    const humidity = forecast.map(({day}) => day.avghumidity);
    const wind = forecast.map(({day}) => day.maxwind_kph);
    // console.log(temp,humidity,wind)
    Array.from(canvas, (can,index) => {
        const ctx = can.getContext("2d");

        // Xóa canvas cũ trước khi vẽ mới
        ctx.clearRect(0, 0, can.width, can.height);

        const height = can.height;
        const width = can.width;
        // padding giữa hai lề và khoảng cách giữa hai bên
        const padding = 30;

        const realheight = height - padding * 2;
        const realwidth = width - padding * 2;
        const spacing = 30;
        const bar_width = (realheight - spacing * 3) / 3;

        console.log(height,width);
        // vẽ title
        drawTitle(ctx,lables[index],can)
        
        // vẽ 2 đường biên
        ctx.beginPath();
        ctx.moveTo(0,0)
        ctx.lineTo(0, realheight);
        ctx.moveTo(0,realheight)
        ctx.lineTo(realwidth,realheight);
        ctx.stroke();

        // vẽ cộtx
        if(index === 0) {
            drawTable(ctx,temp,bar_width,realheight-padding,"red",padding,spacing,date,"°C");
        }else if(index == 1) {
             drawTable(ctx,humidity,bar_width,realheight-padding,"blue",padding,spacing,date,"%");
        }else if(index == 2) {
             drawTable(ctx,wind,bar_width,realheight-padding,"green",padding,spacing,date," km/h");
        }
    })
}

function drawTitle(ctx,lables,can) {
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText(lables, can.width * 2/3, 10);
}

function drawTable(ctx, number, width, height, color, padding, spacing, labels, unit) {
    const maxValue = Math.max(...number);
    number.forEach((val, index) => {
        const heightCol = (val / maxValue) * height;
        const widthCol = width;

        ctx.font = "14px Arial";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "top";

        // Tính toán tọa độ X
        const x = padding + index * (widthCol + spacing);
        
        // Tính toán tọa độ Y để cột mọc từ dưới lên
        const y = padding + height - heightCol;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(x, y, widthCol, heightCol);

        // Hiển thị giá trị trên đầu cột
        ctx.fillStyle = color;
        ctx.textBaseline = "bottom";
        const valueX = x + widthCol / 2;
        const valueY = y - 5;
        ctx.fillText(val + unit, valueX, valueY);

        // Hiển thị ngày bên dưới cột
        if (labels && labels[index]) {
            ctx.fillStyle = "#333";
            ctx.textBaseline = "top";
            
            const labelX = x + widthCol / 2;
            const labelY = padding + height + 5;
            
            ctx.fillText(labels[index], labelX, labelY);
        }
    });
}

const normalizeCityName = (cityName) => {
  if (!cityName) return "";

  // chuyển về chữ thường
  let str = cityName.toLowerCase().trim();

  // loại bỏ dấu do API này không nhận từ có dấu.
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
