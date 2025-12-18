const API_KEY = "64637f968a36414081572223251712";
const WEATHER_API_URL = "https://api.weatherapi.com/v1/forecast.json";
const FORECAST_DAY = 3;
const LANGUAGE = "vi";

// lấy dữ liệu thời tiết từ api theo tên thành phố
export const fetchWeatherByCity = async (cityName) => {
  // 1. Validation dữ liệu
  if (!cityName || cityName.trim() === "") {
    throw new Error("Tên thành phố không được để trống.");
  }
  // chuẩn hóa dữ liệu
  cityName = normalizeCityName(cityName);
  console.log(cityName);

  // xử lý dữ liệu
  try {
    const response = await $.ajax({
      url: WEATHER_API_URL,
      type: "GET",
      data: {
        key: API_KEY,
        q: cityName,
        days: FORECAST_DAY,
        lang: LANGUAGE,
      },
    });

    // 2. Dữ liệu ngày hiện tại : tên thành phố, nhiệt độ, độ ẩm, tốc độ gió.
    const currentData = {
      city: response.location.name,
      temperature: response.current.temp_c,
      humidity: response.current.humidity,
      windSpeed: response.current.wind_kph,
    };

    // 3. Dữ liệu dự đoán 3 ngày tới : tốc độ gió tối đa, ngày, độ ẩm và nhiệt độ trung bình.
    const forecastList = response.forecast.forecastday.map((item) => ({
      date: item.date,
      avgHumidity: item.day.avghumidity,
      maxWindSpeed: item.day.maxwind_kph,
      avgTemp: item.day.avgtemp_c,
    }));

    return {
      current: currentData,
      forecast: forecastList,
    };
  } catch (error) {
    // Lỗi chi tiết
    console.error("API Error Details:", error);
    throw new Error(
      error.responseJSON?.error?.message || "Lỗi khi lấy dữ liệu thời tiết."
    );
  }
};

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

// hàm vẽ biểu đồ dự báo thời tiết
export const renderForecast = (canvas, values, labels, title, unit, color) => {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // khoảng cách giữa 2 lề
  const padding = 60;
  // chiều cao của cột
  const chartHeight = canvas.height - padding * 2;

  // độ rộng và khoảng cách của các cột
  const barWidth = 50;
  const barSpacing = 30;

  const maxValue = Math.max(...values);
  const scaleY = chartHeight / maxValue;

  // Title
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 20);

  // Axis
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(
    padding + 4 * (barWidth + barSpacing) + barSpacing,
    canvas.height - padding
  );
  ctx.stroke();

  // vẽ từng cột
  values.forEach((value, index) => {
    // chiều cao thực tế dựa theo tỉ lệ
    const barHeight = value * scaleY;
    // trục x và y
    const x = padding + index * (barWidth + barSpacing) + barSpacing;
    const y = canvas.height - padding - barHeight;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#000";
    ctx.fillText(value + unit, x + barWidth / 2, y - 5);

    ctx.fillText(labels[index], x + barWidth / 2, canvas.height - padding + 15);
  });
};
