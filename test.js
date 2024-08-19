const activityDate = new Date("2024-08-14");

const today = new Date();

const lastWeekDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);


if(isDateBetween(activityDate, lastWeekDate, today))
{
    console.log("Is between");
}
else
{
    console.log("Not ebtween");
}


function isDateBetween(date, startDate, endDate)
{
  return (date.valueOf() >= startDate.valueOf() && date.valueOf() <= endDate.valueOf());
}