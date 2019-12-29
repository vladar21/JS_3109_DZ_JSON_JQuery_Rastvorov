// класс, осуществляющий отображение полученных в поисковом запросе результатов
class Page
{
    constructor(){    
        this.b = document.getElementById('body');
        this.r1 = document.getElementById('rowfoundcontent');
    
        if (!this.r1) {
            var f1 = document.createElement('div');
            f1.className = "container content col-sm-12 col-md-12 products";
            f1.id = "foundedcontent";
            this.b.appendChild(f1);
    
            this.r1 = document.createElement('div');
            this.r1.className = "row";
            this.r1.id = "rowfoundcontent";
            f1.appendChild(this.r1);
        }
    }

    // выводим дивы с обложкой, названием и годом создания очередной порции фильмов
    // results - выдача поиска (MovieSearch.doSearch()), data - параметры поисковой строки нужны для формирвоания More
    addpage(results, data) {        
        var root = this.r1;     
        var sumsearch = results['totalResults']; 
        var search = results['Search'];   
        var formax = search.length <= 10 ? search.length : 10;
        // Запрос       
    
        for (let i = 0; i < formax; i++) {
            let id = search[i]['imdbID'];       
            let title = search[i]['Title'];
            let type = search[i]['Type'];
            let year = search[i]['Year'];
            let poster = search[i]['Poster'];       
    
            // Создаем карточку фильма                             
    
            var d3 = document.createElement('div');
            d3.className = "col-sm-4 col-md-3";           
            root.appendChild(d3);
    
            var d4 = document.createElement('div');
            d4.className = "product";
            d3.appendChild(d4);
    
            var d5 = document.createElement('div');
            d5.className = "product-img";
            d5.id = id;
            d5.setAttribute('onclick', 'openmodal(this)');
            d4.appendChild(d5);
    
            var img = document.createElement('img');
            img.src = poster;
            d5.appendChild(img);
    
            var span1 = document.createElement('span');
            span1.className = "product-title";
            d4.appendChild(span1);
    
            var h5 = document.createElement('h5');
            span1.appendChild(h5);
    
            var a1 = document.createElement('a');
            a1.textContent = title;
            h5.appendChild(a1);
    
            var span2 = document.createElement('span');
            span2.className = "product-desc";
            span2.textContent = type;
            d4.appendChild(span2);
    
            var br = document.createElement('br');
            d4.appendChild(br);
    
            var span3 = document.createElement('span');
            span2.className = "product-price";
            span2.textContent = year;
            d4.appendChild(span3);
        }

        // удаляем предыдущий More ...   
        var mid = document.getElementById('idmore');
        if (mid) mid.remove(document);
    
        // созадем новый More ...
        if (sumsearch > 10) {
            var dm = document.createElement('div');
            dm.className = "col-sm-4 col-md-3";
            dm.id = "idmore";
            root.appendChild(dm);
    
            var dm1 = document.createElement('div');
            dm1.className = "product";
            dm1.style = "margin-top:50%;font-style:italic;";
           
            // формируем данные для следующей порции фильмов
            data.p++;            
            dm1.setAttribute('onclick', 'more('+JSON.stringify(data)+', '+JSON.stringify(this) +')');
            dm.appendChild(dm1);
    
            var spana = document.createElement('span');
            spana.textContent = 'more ...';
            dm1.appendChild(spana);
    
            var dimg = document.createElement('div');
            dimg.className = "product-img";
            spana.appendChild(dimg);
    
            var img = document.createElement('img');
            img.src = "ajax-loader.gif";
            img.id = "loadImg";
            dimg.appendChild(img);
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
        // меняем номер страницв в запросе на следующий
        // this.next;
        
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
            var posterimg = document.getElementById('idposter');
            posterimg.src = resp.Poster;
            posterimg.alt = resp.Title;
            var titlemovie = document.getElementById('idtitlecontent');
            titlemovie.innerHTML = resp.Title;
            var titlemoviemodal = document.getElementById('idtitlemodal');
            titlemoviemodal.innerHTML = resp.Title;
            var summarymovie = document.getElementById('idsummary');
            summarymovie.innerHTML = resp.Plot;
            var actors = document.getElementById('idActors');
            actors.innerHTML = "<b>Actors:</b> " + resp.Actors;
            var awards = document.getElementById("idAwards");
            awards.innerHTML = "<b>Awards:</b> " + resp.Awards;
            var BoxOffice = document.getElementById("idBoxOffice");
            BoxOffice.innerHTML = "<b>BoxOffice:</b> " + resp.BoxOffice;
            var country = document.getElementById("idCountry");
            country.innerHTML = "<b>Country:</b> " + resp.Country;
            var DVD = document.getElementById("idDVD");
            DVD.innerHTML = "<b>DVD:</b> " + resp.DVD;
            var director = document.getElementById("idDirector");
            director.innerHTML = "<b>Director:</b> " + resp.Director;
            var genre = document.getElementById("idGenre");
            genre.innerHTML = "<b>Genre:</b> " + resp.Genre;
            var language = document.getElementById("idLanguage");
            language.innerHTML = "<b>Language:</b> " + resp.Language;
            var production = document.getElementById("idProduction");
            production.innerHTML = "<b>Production:</b> " + resp.Production;
            var rated = document.getElementById("idRated");
            rated.innerHTML = "<b>Rated:</b> " + resp.Rated;
            var ratings = document.getElementById("idRatings");
            // Выводим рейтинги
            if (resp.Ratings.length > 1) {
                ratings.innerHTML = "<b>Ratings:</b>";
                var nul = document.createElement('ul');
                ratings.appendChild(nul);
                for (let i = 0; i < resp.Ratings.length; i++) {
                    var nl = document.createElement('li');
                    nl.innerHTML = '<b>' + resp.Ratings[i].Source + '</b>, ' + resp.Ratings[i].Value;
                    nul.appendChild(nl);
                }
            } else {
                ratings.innerHTML = "<b>Ratings:</b> " + resp.Ratings;
            }
            var released = document.getElementById("idReleased");
            released.innerHTML = "<b>Released:</b> " + resp.Released;
            var runtime = document.getElementById("idRuntime");
            runtime.innerHTML = "<b>Runtime:</b> " + resp.Runtime;
            var type = document.getElementById("idType");
            type.innerHTML = "<b>Type:</b> " + resp.Type;
            var website = document.getElementById("idWebsite");
            website.innerHTML = "<b>Website:</b> " + resp.Website;
            var writer = document.getElementById("idWriter");
            writer.innerHTML = "<b>Writer:</b> " + resp.Writer;
            var year = document.getElementById("idYear");
            year.innerHTML = "<b>Year:</b> " + resp.Year;
            var imdbID = document.getElementById("idImdbID");
            imdbID.innerHTML = "<b>imdbID:</b> " + resp.imdbID;
            var imdbRating = document.getElementById("idImdbRating");
            imdbRating.innerHTML = "<b>imdbRating:</b> " + resp.imdbRating;
            var imdbVotes = document.getElementById("idImdbVotes");
            imdbVotes.innerHTML = "<b>imdbVotes:</b> " + resp.imdbVotes;
        }
    }
    jasonhttp.send(null)    
}

// закрываем модальное окно
function closemodal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}
