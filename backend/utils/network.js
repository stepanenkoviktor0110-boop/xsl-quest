const os = require("os");

function getServerIPs() {
  const networkInterfaces = os.networkInterfaces();
  const ips = [];

  ips.push("localhost");

  console.log("🔍 Поиск сетевых интерфейсов:");

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    console.log(`  📡 Интерфейс: ${interfaceName}`);

    networkInterfaces[interfaceName].forEach((interface) => {
      console.log(
        `    - Адрес: ${interface.address} (Семейство: ${interface.family}, Внутренний: ${interface.internal})`
      );

      if (interface.family === "IPv4" && !interface.internal) {
        if (
          !interface.address.startsWith("169.254") &&
          !interface.address.startsWith("127.") &&
          !interface.address.startsWith("0.") &&
          interface.address !== "255.255.255.255"
        ) {
          console.log(`    ✅ Добавлен IP: ${interface.address}`);
          ips.push(interface.address);
        }
      }
    });
  });

  if (ips.length === 1) {
    console.log(
      "⚠️  Не найдено сетевых IP-адресов. Проверьте подключение к сети."
    );
  }

  console.log(`📊 Всего найдено IP-адресов: ${ips.length}`);
  return ips;
}

function printServerInfo(port) {
  console.log(`✅ Сервер запущен!`);
  console.log(`📁 Локальный доступ: http://localhost:${port}`);
  console.log(`📱 Доступ с других устройств в вашей сети:`);

  const networkInterfaces = os.networkInterfaces();

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === "IPv4" && !interface.internal) {
        console.log(`   http://${interface.address}:${port}`);
      }
    });
  });

  console.log(
    `\n📊 Откройте любой из этих адресов на вашем телефоне или планшете`
  );
}

module.exports = {
  getServerIPs,
  printServerInfo,
};
