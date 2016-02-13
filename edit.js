var Planes;

function loadData(){
	$.ajax({
	  url: 'db/core.php',
	  type: "GET",
	  success: function(data){
		var planes = JSON.parse(data);

		createListByIndexSort(dListProduction, 'production', planes);
		createListByIndexSort(dListSeats, 'seats', planes);
		createListByIndexSort(dListWeight, 'weight', planes);
		createListByIndexSort(dListPrice, 'price', planes);
		
		init(dListPrice, 'price');
		init(dListSeats, 'seats');
		init(dListProduction, 'production');
		init(dListWeight, 'weight');
		synhronize('price');
		
		jQuery('#main-block').show();
		jQuery('#edit-block').hide();
		jQuery('#load-data-btn').hide();
		jQuery('#edit-data-btn').hide();
	  }
	});
}

jQuery(document).ready(function() {
	$.ajax({
	  url: 'db/core.php',
	  type: "GET",
	  success: function(data){
		var planes = JSON.parse(data);
		Planes = planes;
		var table = "";
		for (i in planes) {
			table += "<tr>";
			var plane = planes[i];
			for (j in plane) {
				table += "<td>";
				table += plane[j];
				table += "</td>";
			}	
			table += "<td><a onclick='editPlane(" + i + ")'>Edit</a></td>";	
			table += "<td><a onclick='deletePlane(" + plane['id'] + ")'>Delete</a></td>";		
			table += "</tr>";
		}
		jQuery('#planes-table-body').html(table);
	  }
	});
});

function editPlane(i) {
	var plane = Planes[i];

	jQuery('#edit-modal-window input#name').val(plane.name);
	jQuery('#edit-modal-window input#production').val(plane.production);
	jQuery('#edit-modal-window input#price').val(plane.price);
	jQuery('#edit-modal-window input#seats').val(plane.seats);
	jQuery('#edit-modal-window input#weight').val(plane.weight);
	jQuery('#edit-modal-window input#image').val(plane.img);

	jQuery('#edit-modal-window #save-plain-btn').attr('onclick', 'savePlane(' + plane['id'] + ')');
	jQuery('#edit-modal-window').modal('show');
}

function savePlane(id) {
	var plane = {};
	plane['id'] = id;
	plane['name'] = jQuery('#edit-modal-window input#name').val();
	plane['production'] = jQuery('#edit-modal-window input#production').val();
	plane['price'] = jQuery('#edit-modal-window input#price').val();
	plane['seats'] = jQuery('#edit-modal-window input#seats').val();
	plane['weight'] = jQuery('#edit-modal-window input#weight').val();
	plane['image'] = jQuery('#edit-modal-window input#image').val();
	var data = {plane: JSON.stringify(plane)};

	$.ajax({
	    url: 'db/update.php',
	    dataType: 'json',
	    type: 'POST',
	    data: data,
	    success: function(result) {	    
	    	console.log(result);
	    	if (result.ok) {
	    		location.reload();
		    }
	    }
	});	
}

function deletePlane(id) {
	if (confirm('Are you sure?')) {
		$.ajax({
		    url: 'db/delete.php',
		    type: 'POST',
		    data: {id: id},
		    success: function(result) {
		    	result = JSON.parse(result);
		    	if (result.ok) {
			    	//alert('Deleted');
			        location.reload();
			    }
		    }
		});
	}
}

