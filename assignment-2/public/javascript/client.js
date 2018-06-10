function validateRegistration() {
	var x = document.forms["reg-form"]["u_name"].value;
    if (x == null || x == "") {
        alert("User name must be filled out");
        return false;
	}
	x = document.forms["reg-form"]["e_mail"].value;
    if (x == null || x == "") {
        alert("Email must be filled out");
        return false;
	}
	x = document.forms["reg-form"]["p_word"].value;
	var y = document.forms["reg-form"]["p_word2"].value;
	if (x == null || x == "" || y == null || y == "" || x != y) {
        alert("Both password fields must be filled out, and they must match.");
        return false;
	}
	x = document.forms["reg-form"]["f_name"].value;
    if (x == null || x == "") {
        alert("First name must be filled out");
        return false;
	}
	x = document.forms["reg-form"]["l_name"].value;
    if (x == null || x == "") {
        alert("Last name must be filled out");
        return false;
	}
	x = document.forms["reg-form"]["terms"].value;
    if (x == false) {
        alert("You must first accept the terms and conditions");
        return false;
	}
}

function getId(e){
	return $(e.target).parent('tr').data('id');
}

function removeUnderscore(string){
    return string.replace("_", " ");
}

function editForm(e, id){
	$('.editContainer').html('');
	var form = '<h3>After changes are made "click" <i>Register</i></h3><form class="input edit-form col-md-6">' + $('.post').html() + '</form>';
	$('.editContainer').append(form);
	$('.edit-form .register').removeClass('register').addClass('edit-task');
	$.ajax({
		url: '/account?id=' + id,
		success: function(data){
			var obj = JSON.parse(data.results);
			var gender = obj[0].Gender === 0 ? 'male' : 'female';
			$('.edit-form input[name=u_name]').val(obj[0].User_Name);
			$('.edit-form input[name=e_mail]').val(obj[0].Email);
			$('.edit-form input[name=p_word]').val(obj[0].Password);
			$('.edit-form input[name=f_name]').val(obj[0].First_Name);
			$('.edit-form input[name=l_name]').val(obj[0].Last_Name);
			$('.edit-form input[name=street]').val(obj[0].Street);
			$('.edit-form input[name=city]').val(obj[0].City);
			$('.edit-form input[name=state]').val(obj[0].State);
			$('.edit-form input[name=zip]').val(obj[0].Zip);
			$('.edit-form input[name=gender]').val(gender);
			
			$('input[name=u_name]', '.register').val(obj[0].User_Name);
			$('input[name=e_mail]', '.register').val(obj[0].Email);
			$('input[name=p_word]', '.register').val(obj[0].Password);
			$('input[name=p_word2]', '.register').val(obj[0].Password);
			$('input[name=f_name]', '.register').val(obj[0].First_Name);
			$('input[name=l_name]', '.register').val(obj[0].Last_Name);
			$('input[name=street]', '.register').val(obj[0].Street);
			$('input[name=city]', '.register').val(obj[0].City);
			//$('#stateselect').append($('<option>').text(value).attr('value', value));
			$('input[name=zip]', '.register').val(obj[0].Zip);
			$('input[name=gender]', '.register').val(obj[0].Gender);
			$('.edit-form .edit-task').on('click', function(e){
				e.preventDefault();
				var query = '';
				query += '?id=' + id;
				query += '&User_Name=' + $('.edit-form input[name=u_name]').val();
				query += '&Email=' + $('.edit-form input[name=e_mail]').val();
				query += '&Password=' + $('.edit-form input[name=p_word]').val();
				query += '&First_Name=' + $('.edit-form input[name=f_name]').val();
				query += '&Last_Name=' + $('.edit-form input[name=l_name]').val();
				query += '&Street=' + $('.edit-form input[name=street]').val();
				query += '&City=' + $('.edit-form input[name=city]').val();
				query += '&State=' + $('.edit-form input[name=state]').val();
				query += '&Zip=' + $('.edit-form input[name=zip]').val();
				query += '&Gender=' + $('.edit-form input[name=gender]').val();
				console.log(query);
				if ($.trim($('.edit-form input[name=u_name]').val()) !== '' &&
					$.trim($('.edit-form input[name=email]').val()) !== '' &&
					$.trim($('.edit-form input[name=password]').val()) !== '' &&
					$.trim($('.edit-form input[name=f_name]').val()) !== '' &&
					$.trim($('.edit-form input[name=l_name]').val()) !== '')
				{
					$.ajax({
						method: 'PUT',
						url: '/update' + query,
						success: getData
					});
				}
			});
		}
	});       
}

function addListeners(){
	$('.remove-account').on('click', function(e){
		var id = getId(e);
		$.ajax({
			url: '/remove-account?id=' + id,
			method: 'DELETE',
			success: getData
		});    
	});
	$('.edit').on('click', function(e){
		var id = getId(e);
		editForm(e, id);
		
	});
}

function renderTable(data, textStatus, jqXHR){
	var json = JSON.parse(data.results);
	$('.tableContainer').html('');
   
	if (json.length > 0){
		var body = document.body;
		var table = document.createElement('table');
		var tableBody = document.createElement('tbody');
		table.className = "records";

		table.style.width = '100%';
		var tr = document.createElement('tr');
		tr.setAttribute('bgcolor','gray');
		for (var key in json[0]){
			if (key !== 'id'){
				var th = document.createElement('th');
				th.style.padding = '13px';
				th.style.fontSize = '20px';
				th.style.color = 'white';
				th.appendChild(document.createTextNode(removeUnderscore(key)));
				tr.appendChild(th);
			}
		}
		var th = document.createElement('th');
		tr.appendChild(th);
		tr.appendChild(th);
		tableBody.appendChild(tr);
		for (var i = 0; i < json.length; i++){
			tr = document.createElement('tr');
			tr.style.borderBottom = '1pt solid black';
			for (var k in json[i]){
				if (k !== 'id'){
					var td = document.createElement('td');
					td.style.paddingLeft = '15px';
					var label = json[i][k];
					if((k == "Zip" && label == "0") || label == "undefined" || label == "un" || label == "null")
						label = "\t\u2014";
					if(k == "Gender")
						(label == 0) ? label = "male" : label = "female";
					td.appendChild(document.createTextNode(label));
					tr.appendChild(td);
				}else{
					tr.setAttribute('data-id', json[i][k]);
				}
			}	
			var edit = document.createElement('button');
			edit.className = 'btn btn-default edit';
			edit.appendChild(document.createTextNode('edit'));
			var del = document.createElement('button');
			del.className = 'btn btn-danger remove-account';
			del.appendChild(document.createTextNode('Remove Account'));
			tr.appendChild(edit);
			tableBody.appendChild(tr);
			tr.appendChild(del);
			tableBody.appendChild(tr); 
		}
		table.appendChild(tableBody);
		var div = document.getElementsByClassName('tableContainer')[0];
		div.appendChild(table);
	}else{
		$('.tableContainer').html('');
	}
	addListeners();
}

function getData(){
	$('.editContainer').html('');
	$.ajax({
		url: '/account',
		dataType: 'json',
		success: renderTable
	});
}

$(document).ready(function(){
	getData();

	$('input[name=terms]')[0].checked == true;
	$('.registeruser').on('click', function(e){
		e.preventDefault();
		var x = document.getElementById("stateselect").selectedIndex;
		var newUser = {};
		newUser['username'] = $('input[name=u_name]').val();
		newUser['email'] = $('input[name=e_mail]').val();
		newUser['password'] = $('input[name=p_word]').val();
		newUser['firstname'] = $('input[name=f_name]').val();
		newUser['lastname'] = $('input[name=l_name]').val();
		newUser['street'] = $('input[name=street]').val();
		newUser['city'] = $('input[name=city]').val();
		newUser['state'] = document.getElementsByTagName("option")[x].value;
		newUser['zip'] = $('input[name=zip]').val();
		newUser['gender'] = $('input[name=gender]').val();
		$.ajax({
			url: '/storeuser',
			method: 'POST',
			data: newUser,
			success: getData
		});   
		
	});       
});