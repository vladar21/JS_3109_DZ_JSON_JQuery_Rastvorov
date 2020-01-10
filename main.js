// класс, осуществляющий отображение полученных в поисковом запросе результатов
class Page
{
    constructor(){    
        // готовим страницу для вывода результатов запроса
        this.b = $('body');
        this.r1 = $('#rowfoundcontent');        

        if (this.r1.length == 0) {
            
            var f1 = $('<div>');
            
            $(f1).addClass('container content col-sm-12 col-md-12 products').attr('id','foundedcontent');
            $(this.b).append(f1);          
    
            this.r1 = document.createElement('div');
            this.r1.className = "row";
            this.r1.id = "rowfoundcontent";
            $(f1).append(this.r1);
        }
    }

    // выводим дивы с обложкой, названием и годом создания очередной порции фильмов
    // results - выдача поиска (MovieSearch.doSearch()), data - параметры поисковой строки нужны для формирвоания More
    addpage(results, data) {  
        debugger      
        var root = this.r1;     
        var sumsearch = results['totalResults']; 
        var search = results['Search'];   
        var formax = search.length <= 10 ? search.length : 10;       
    
        for (let i = 0; i < formax; i++) {
            debugger
            let id = search[i]['imdbID'];       
            let title = search[i]['Title'];
            let type = search[i]['Type'];
            let year = search[i]['Year'];
            let poster = search[i]['Poster'];       
    
            // Создаем карточку фильма                             
    
            var d3 = $('<div>');
            $(d3).addClass('col-sm-4 col-md-3');
            $(root).append(d3);
    
            var d4 = $('<div>');
            $(d4).addClass('product');
            $(d3).append(d4);

            var d5 = $('<div>');
            $(d5).addClass('product-img').attr('id', id).attr('onclick', 'openmodal(this)');
            $(d4).append(d5);
    
            var img = $('<img/>');
            $(img).attr('src', poster);
            $(d5).append(img);
    
            var span11 = $('<span>').addClass('product-title');
            $(d4).append(span11);
    
            var h5 = $('<h5>');
            $(h5).text(title);
            $(span11).append(h5);

            var span2 = $('<span>');
            $(span2).addClass('product-desc').text(type);
            $(d4).append(span2);
    
            var br = $('<br/>');
            $(d4).append(br);
    
            var span3 = $('<span>');
            $(span3).addClass('product-price').text(year);
            $(d4).append(span3);
            
        }

        // удаляем предыдущий More ..., если он есть
        var mid = $('#idmore');
        if (mid) $(mid).remove();
    
        // созадем новый More ...
        if (sumsearch > 10) {
            var dm = $('<div>');
            $(dm).addClass('col-sm-4 col-md-3').attr('id', 'idmore');
            $(root).append(dm);
    
            var dm1 = $('<div>');
            $(dm).append(dm1);
            $(dm1).addClass('product');
            $(dm1).css({'margin-top':'50%','font-style':'italic'});
            // формируем данные для следующей порции фильмов
            data.p++;
            $(dm1).attr('onclick', 'more('+JSON.stringify(data)+')');         
    
            var spana = $('<span>');
            $(spana).text('more ...');
            $(dm1).append(spana);

            var dimg = $('<div>');
            $(dimg).addClass('product-img');
            $(spana).append(dimg);     

            var img = $('<img/>');
            $(img).attr('src', 'ajax-loader.gif').attr('id', 'loadImg');
            $(dimg).append(img);   
        }    
       
    }    

}

// класс, выполняющий поиск фильмов на сайте-доноре
class MovieSearch
{

    //API_KEY и адрес API в нашем лучше задать константами внутри класса, который с ними и работает
    //нет смысла передавать его параметром или хранить снаружи (разве что в файлах настроек, но их в этом приложении нет)
    API_KEY = "365d77a0";
    API_URI = "http://www.omdbapi.com/";

    constructor(data){
        this.data = data;     
        this.queryString = `${this.API_URI}?apikey=${this.API_KEY}&s=${data.s}&y=${data.y}&type=${data.type}&page=${data.p}&r=json`;
    }

    //Функция, которая будет искать фильмы по параметрам
    //Возвращает объект с результатами, полученный из API 
    //Функция callback дождётся выполнения асинхронного запроса и ей будут отправлены результаты из API
    doSearch(){
        let data = this.data;
        const xmlhttp = new XMLHttpRequest();
        
        xmlhttp.open("GET", this.queryString, true);        
        xmlhttp.onreadystatechange = function(){
       
            //Запрос закончился (readyState == DONE) при этом без HTTP ошибок (HTTP CODE 200)
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {                
                let results = JSON.parse(xmlhttp.response);
                var page = new Page();
                // вызываем функцию addpage (формирует html код выводимых данных о фильмах)
                page.addpage(results, data);
            }
        }        
        xmlhttp.send(null);
    }
    
}

// класс для храения параметров поисковой строки
class DataString{
    constructor(s, y, type, p){
        this.s = s;
        this.y = y;
        this.type = type;
        this.p = p;  
    }
}

// стартовая функция
function get_params_form(form){
    // Чистим поле для найденных фильмов от данных предыдущего запроса
    var fid = document.getElementById('foundedcontent');
    if (fid) fid.remove(document);

    // Получаем данные из формы    
    var s = form.elements["t"].value;
    var y = form.elements["y"].value;
    var type = form.elements["type"].value;
    var p = (p != null)?p:1;
    // формируем поисковый объект (строку) с данными из формы 
    var data = new DataString(s, y, type, p);

    //Использование класса

    //В том месте программы, где нужен сервис поиска фильмов вы создаёте объект сервиса
    var movieSearch = new MovieSearch(data);   

    //Далее вызываете функцию поиска, в которую передаёте параметры s, y, type
    //Последний параметр ()=> - анонимная стрелочная функция, которая будет вызвана когда результаты из API будут готовы
    //в ней мы можем что-то делать с результатами из API дальше
    //Если хотите - можете сделать и не анонимную и не стрелочную функцию
    
    movieSearch.doSearch();
}

// стартуем загрузку следующей порции данных о фильмах
function more(data){
    startLoadingAnimation();
    var ms = new MovieSearch(data);
    ms.doSearch();
} 

// стартуем гифку с анимашкой (крутилкой) ожидания
function startLoadingAnimation() // - функция запуска анимации
{
    // найдем элемент с изображением загрузки и уберем невидимость:
    var imgObj = document.getElementById("loadImg");
    imgObj.textContent = "";
    imgObj.style = "position: relative; z-index: 1000; display: inline-block;";
}

// открываем модальное окно с информацией о фильме
function openmodal(div) {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    // получаем данные о фильме в формате JSON
    var urlID = "http://www.omdbapi.com/?apikey=365d77a0&r=json&plot=full&i=" + div.id;

    var jasonhttp = new XMLHttpRequest();
    jasonhttp.open("GET", urlID, true);
    // Запрос
    jasonhttp.onreadystatechange = function () {

        if (jasonhttp.readyState == 4) {
            var resp = JSON.parse(jasonhttp.response);

            // Формируем содержание модального окна
            var postering = $('#idposter');
            $(postering).attr('src', resp.Poster).attr('alt', resp.Title);
            var titlemovie = $('#idtitlecontent');
            $(titlemovie).html(resp.Title);
            var titlemoviemodal = $('#idtitlemodal');
            $(titlemoviemodal).html(resp.Title);
            var summarymovie = $('#idsummary');
            $(summarymovie).html(resp.Plot);
            var actors = $('#idActors');
            $(actors).html("<b>Actors:</b> " + resp.Actors);
            var awards = $('#idAwards');
            $(awards).html("<b>Awards:</b> " + resp.Awards);
            var BoxOffice = $('#idBoxOffice');
            $(BoxOffice).html("<b>BoxOffice:</b> " + resp.BoxOffice);
            var country = $('#idCountry');
            $(country).html("<b>Country:</b> " + resp.Country);
            var DVD = $('#idDVD');
            $(DVD).html("<b>DVD:</b> " + resp.DVD);
            var director = $('#idDirector');
            $(director).html("<b>Director:</b> " + resp.Director);
            var genre = $('#idGenre');
            $(genre).html("<b>Genre:</b> " + resp.Genre);
            var language = $('#idLanguage');
            $(language).html("<b>Language:</b> " + resp.Language);
            var production = $('#idProduction');
            $(production).html("<b>Production:</b> " + resp.Production);
            var rated = $('#idRated');
            $(rated).html("<b>Rated:</b> " + resp.Rated);
            var ratings = $('#idRatings');
            // Выводим рейтинги
            if (resp.Ratings.length > 1) {
                $(ratings).html("<b>Ratings:</b>");
                var nul = $('<ul>');
                $(ratings).append(nul);
                for (let i = 0; i < resp.Ratings.length; i++) {
                    var nl = $('<li>');
                    $(nl).html('<b>' + resp.Ratings[i].Source + '</b>, ' + resp.Ratings[i].Value);
                    $(nul).append(nl);
                }
            } else {
                $(ratings).html("<b>Ratings:</b> " + resp.Ratings);
            }
            var released = $('#idReleased');
            $(released).html("<b>Released:</b> " + resp.Released);
            var runtime = $('#idRuntime');
            $(runtime).html("<b>Runtime:</b> " + resp.Runtime);
            var type = $('#idType');
            $(type).html("<b>Type:</b> " + resp.Type);
            var website = $('#idWebsite');
            $(website).html("<b>Website:</b> " + resp.Website);
            var writer = $('#idWriter');
            $(writer).html("<b>Writer:</b> " + resp.Writer);
            var year = $('#idYear');
            $(year).html("<b>Year:</b> " + resp.Year);
            var imdbID = $('#idImdbID');
            $(imdbID).html("<b>imdbID:</b> " + resp.imdbID);
            var imdbRating = $('#idImdbRating');
            $(imdbRating).html("<b>imdbRating:</b> " + resp.imdbRating);;
            var imdbVotes = $('#idImdbVotes');
            $(imdbVotes).html("<b>imdbVotes:</b> " + resp.imdbVotes);
        }
    }
    jasonhttp.send(null)    
}

// закрываем модальное окно
function closemodal() {
    var modal = $('#myModal');
    $(modal).css("display", "none");
}
