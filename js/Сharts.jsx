/**
 * -D- Подзагружаем все графики и их названия; 
*/
var Сharts = React.createClass({
    render:function(){
        return (
            <div>
                <h3>Разница курсов валют</h3>
                <div className="bottom-right-svg">
                    <LineChart/>
                </div>
            </div>
        )
    }
});

ReactDOM.render(
	<Сharts/>,
	document.getElementById('charts')
);