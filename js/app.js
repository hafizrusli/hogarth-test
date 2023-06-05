async function fetchJSON(jsonFile) {
  const response = await fetch('json/'+jsonFile+'.json');
  const theJson = await response.json();
  return theJson;
}

function movieHTML(movie){
	return `<div class="col-6 col-md-3">
		<a href="#">
			<div class="poster-wrapper">
				<img onload="this.style.opacity=1" srcset="`+movie.poster2x+` 2x" src="`+movie.poster+`" alt="" />
			</div>
			<div class="movie-title">`+movie.title+`</div>
			<div class="cat-year">
				<div>`+movie.genre+`</div> <div>•</div> <div>`+movie.year+`</div>
			</div>
		</a>
	</div>`
}

$(document).ready(function(){
	// Fetch genre JSON and generate DOM elements
	fetchJSON('genres').then(genres =>{
		for(var i=parseInt(genres.length)-1; i>=0; i--){
			$(".filter-wrapper").prepend(`<a class="d-none d-md-inline-block btn-genre col-auto `+genres[i]+`" href="#">`+genres[i]+`</a>`)
			$(".filters.genre").prepend(`<div class="form-check">
				<input class="form-check-input" type="checkbox" value="`+genres[i]+`" id="check`+genres[i]+`">
				<label class="form-check-label" for="check`+genres[i]+`">
					`+genres[i]+`
				</label>
			</div>`)
		}
	})

	fetchJSON('page-1').then(res => {
		var movies = res.data
		$(".movies").html("")
		$(".page-meta").removeClass("d-none")
		$(".item").html(parseInt(res.page)*4);
		$(".total").html(res.total);
		$.each(movies,function(i){
			$(".movies").append(movieHTML(movies[i]))
		})
	});
	
	// Fetch all movies for filter purpose
	var allmovies
	fetchJSON("all-movies").then(res => {
		allmovies = res.data
	})

	// When genre button clicked -->
	$(".filter-wrapper").on("click",".btn-genre",function(e){
		e.preventDefault();
		$(this).toggleClass("active")
		var checkbox = $("#check"+$(this).html())
		checkbox.prop('checked', !checkbox.prop("checked"));
		$(".movies").html("");
		var filtered = []
		if($(".filter-wrapper a.active:not([class^='btn-filter']").length > 0){
			$(".filter-wrapper a.active:not([class^='btn-filter']").each(function(){
				filtered.push($(this).html())
			})
			var filteredMovies= allmovies.filter(function(item) {
				for (var i=0;i<filtered.length;i++) {
					if (item["genre"] == filtered[i])
					return true;
				}
				return false;
			});
			$.each(filteredMovies,function(i){
				$(".movies").append(movieHTML(filteredMovies[i]))
			})
			$(".btn-more").hide()
			$(".item").html(filteredMovies.length)
			$(".btn-filter").addClass("active")
			$(".clear").removeClass("d-none")
		}else{
			$(".item").html(allmovies.length)
			$(".total").html(allmovies.length)
			$.each(allmovies,function(i){
				$(".movies").append(movieHTML(allmovies[i]))
			})
			$(".btn-filter").removeClass("active")
			$(".clear").addClass("d-none")
		}
	})

	// Toggle popup filter when filter button is clicked
	$(".btn-filter").on("click",function(e){
		e.preventDefault();
		$(".popup-filter").toggleClass("open")
		$(this).toggleClass("open")
	})

	// Load more movies
	$(".btn-more").on("click", function(e){
		e.preventDefault()
		var nextPage = $(this).data("next-page")
		$(this).data("next-page",parseInt(nextPage)+1)
		fetchJSON('page-'+nextPage).then(res=>{
			var movies = res.data
			if((res.page*4)>res.total){
				$(".btn-more").hide()
				$(".item, .total").html(res.total)
			}else{
				$(".item").html(parseInt(res.page)*4)
				$(".total").html(res.total)
			}
			$.each(movies,function(i){
				$(".movies").append(movieHTML(movies[i]))
			})
		})
	})

	// Clear filter button and link when clicked
	$(".btn-clear,.clear").on("click",function(e){
		e.preventDefault();
		$(".movies").html("");
		$(".item").html(allmovies.length)
		$(".total").html(allmovies.length)
		$.each(allmovies,function(i){
			$(".movies").append(movieHTML(allmovies[i]))
		})
		$(".btn-filter,.btn-genre").removeClass("active")
		$(".form-check-input").prop('checked', false);
		$(".clear").addClass("d-none")
	})

	// Reveal clear link when checkbox is selected
	$(".filter-wrapper").on("click","input,label",function(e){
		if($('.form-check-input:checkbox:checked').length > 0){
			$(".clear").removeClass("d-none")
		}else{
			$(".clear").addClass("d-none")
		}
	})

	// Apply filter
	$(".btn-apply").on("click",function(e){
		e.preventDefault();
		$(".popup-filter").toggleClass("open")
		$(".btn-filter").removeClass("open")
		$(".btn-more").hide()
		$(".movies").html("");
		var filtered_genre = []
		$('.filters.genre .form-check-input:checkbox:checked').each(function(){
			filtered_genre.push($(this).val())
			$(".btn-genre."+$(this).val()).addClass("active")
		})
		var filtered_year = []
		$('.filters.year .form-check-input:checkbox:checked').each(function(){
			filtered_year.push($(this).val())
		})
		var filteredMovies= allmovies.filter(function(item) {
			if(filtered_genre.length > 0 && filtered_year.length > 0){
				$(".btn-filter").addClass("active")
				for (var i=0;i<filtered_genre.length;i++) {
					for(var j=0;j<filtered_year.length;j++){
						if (item["genre"] == filtered_genre[i] && item["year"] == filtered_year[j]){
							return true;
						}
					}
				}
			}else if(filtered_genre.length > 0){
				$(".btn-filter").addClass("active")
				for (var i=0;i<filtered_genre.length;i++) {
					if (item["genre"] == filtered_genre[i]){
						return true;
					}
				}
			}else if(filtered_year.length > 0){
				$(".btn-genre").removeClass("active");
				for(var j=0;j<filtered_year.length;j++){
					if (item["year"] == filtered_year[j]){
						return true;
					}
				}
			}
			return false;
		});
		$(".item").html(filteredMovies.length)
		$.each(filteredMovies,function(i){
			$(".movies").append(movieHTML(filteredMovies[i]))
		})
	})

})//end document.ready
