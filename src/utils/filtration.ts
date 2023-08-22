// 格式化时间  时分秒
export function filterTime(
  time: any,
  sym: string = "-",
  isHMS: boolean = true
) {
  if (time == null) {
    return "";
  }
  let d = new Date(time);
  if (d.getHours() < 10) {
    var Hours: string | number = "0" + d.getHours();
  } else {
    var Hours: string | number = d.getHours();
  }
  if (d.getMinutes() < 10) {
    var Minutes: string | number = "0" + d.getMinutes();
  } else {
    var Minutes: string | number = d.getMinutes();
  }
  if (d.getSeconds() < 10) {
    var Seconds: string | number = "0" + d.getSeconds();
  } else {
    var Seconds: string | number = d.getSeconds();
  }

  if (isHMS) {
    return (
      d.getFullYear() +
      sym +
      (d.getMonth() + 1) +
      sym +
      d.getDate() +
      " " +
      Hours +
      ":" +
      Minutes +
      ":" +
      Seconds
    );
  } else {
    return d.getFullYear() + sym + (d.getMonth() + 1) + sym + d.getDate();
  }
}
