// logic xử lý nghiệp vụ trung tâm
import { fetchWeatherByCity } from "./weather-helper.js";
import { renderForecast } from "./weather-helper.js";

const searchBtn = document.getElementById("search-button");
const cityname = document.getElementById("city-input");

// Ngày hiện tai
const currentTemp = document.getElementById("current-temp");
const currentHumidity = document.getElementById("current-humidity");
const currentWind = document.getElementById("current-wind");
const currentLocation = document.getElementById("current-location");
const currentTempLeft = document.getElementById("current-tempeture");

// Thông tin các ngày dự báo tới
const forecastChart = document.getElementsByClassName("forecast-chart");
const messageBox = document.getElementById("weather-message");

const FORECAST_DAY = 3

$(searchBtn).click(async function () {
  const city = cityname.value;

  // kiểm tra tên thành phố có chưa
  console.assert((city && city.trim() !== ""),"Tên thành phố không được bỏ trống")

  try {
    if (messageBox) messageBox.textContent = "";

    const data = await fetchWeatherByCity(city);

    const { current, forecast } = data;
    console.log(current, forecast);
    currentLocation.innerText = `Địa điểm: ${current.city}`;
    currentTemp.innerText = `Nhiệt độ : ${current.temperature}°C`;
    currentHumidity.innerText = ` ${current.humidity}%`;
    currentWind.innerText = ` ${current.windSpeed} kph`;
    currentTempLeft.innerText = `${current.temperature}`

    // kiểm tra xem đủ số lượng ngày
    console.assert(forecast.length === FORECAST_DAY, "Không đủ số lượng dự đoán ngày")

    // renderForecast(forecast);
    // console.log(forecast)

    const humidityForecast = forecast.map((item) => item.avgHumidity);
    const speedForecast = forecast.map((item) => item.maxWindSpeed);
    const tempForecast = forecast.map((item) => item.avgTemp);

    // 3 ngày tiếp
    const dayForecast = forecast.map((item) =>
      item.date.split("-").reverse().join("-")
    );

    // Dự báo theo tiêu chí độ ẩm, nhiệt độ, tốc độ gió
    Array.from(forecastChart).forEach((canvas,index) => {
        if(index === 0) {
            // vẽ biểu đô độ ẩm
            renderForecast(canvas,humidityForecast,dayForecast,"Độ ẩm", "%","#1E88E5");
        }else if(index === 1) {
            // vẽ biểu đồ nhiệt độ
            renderForecast(canvas,tempForecast,dayForecast,"Nhiệt độ", "°C","#E53935");
        }else if(index === 2) {
            // vẽ biểu đồ tốc độ gió
            renderForecast(canvas,speedForecast,dayForecast,"Tốc độ gió", " km/h","#43A047");
        }else{
            // thêm các biểu đồ khác tại đây
        }
    });
  } catch (error) {
    console.error(error);
    if (messageBox)
      messageBox.textContent = error.message || "Lỗi khi lấy dữ liệu.";
  }
});


