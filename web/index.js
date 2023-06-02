var myclass = null;

async function run() {
  // A service worker must be registered in order to send notifications on iOS
  const registration = await navigator.serviceWorker.register(
    "serviceworker.js",
    {
      scope: "./",
    }
  );

  const gbutton = document.getElementById("btn");
  gbutton.addEventListener("click", async () => {
    myclass = grade.value + classname.value;
    window.location.href = `./web${myclass}.html`;
  });
}

run();
