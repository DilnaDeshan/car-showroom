const select = document.getElementById('inv_year');
const current_year = new Date().getFullYear();

//loop for year
for(let i = current_year; i >=1900 ; i--)
{
    let option = document.createElement('option');
    option.value =  i ; 
    option.textContent = i;
    select.appendChild(option);
}

console.log("Inventory JS loaded");


//price range

