$( document ).ready(function() {

  //animaciones normales de jquery
  $("#content-wrapper").hide();
  $("#content-wrapper").show("normal")
  
  //Cambios cuando se agrega un documento xml
  $(document).on('change', 'input[type=file]', function(e){

    //Busca la direccion temporal y la guarda en la variable
    var TmpPath = URL.createObjectURL(e.target.files[0]);
    //console.log(TmpPath);

    //Ajax la comunicacion con el documento y la extraccion del texto
    $.ajax({
      type: "GET",
      url: TmpPath,//direccion temporal del archivo
      dataType: "xml",//tipo de dato que se va a manipular
      success: function(xml){
        
        //Extrae los datos del xml pra filtrarlos
        xmlDoc = xml.documentElement.innerHTML;
        //console.log(xmlDoc);
        //funcion principal de filtro
        $("#pestañas").empty();
        $("#myTabContent").empty();

        //Se recarga la pestaña general 
        $("#pestañas").append('<li class="nav-item">'+
                    '<a class="nav-link active bordes" id="home-tab" data-toggle="tab" data-idcampo="salida" data-textatrea="campotlhome" href="#home" onclick="fnpestaña(this)" role="tab" aria-controls="home" aria-selected="true">General</a>'+
                  '</li>');
        $("#myTabContent").append(' <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab"></div>'); 
        
        //Entrada a la funcion principal con parametros de entrada
        principal(xmlDoc);

    },
    error: function() {
      alert("Error en la direcion intentelo de nuevo.");
    }
    });  
  });

});


variablex = [];

//funcion principal encargada de hacer el mapeo
function principal(xmlDoc){

  //Variable para las condicionales del input
  counter = 0;

  //Limpia lo campos para qu se utilizen otra vez
  $("#entrada").empty();
  $("#cuadros").empty();
  $("#salida").empty();
  $("#cuadros").append('<div id="separos"><textarea id="secretocopy"></textarea></div>');
  $("#separos").hide();

  //dividimos por renglon si es que hay mas
  divisor = xmlDoc.split("\n")
  //console.log(divisor);
  //Bucle del divisor aplica si hay mas renglones
  divisor.forEach(function(i) {
    //Para sacar el numero de serie
    ex=i;
    ex=ex.split('"');
    //console.log(ex)
    //Busca las siguientes cadenas de caracteres
    p=i.indexOf("<EjbTransaction")
    q=i.indexOf("/EjbTransaction>")

    //cortamos para reducir el codigo y solo el que vamos a ocupar
    addwords=i.slice(p,q);
    //conta potr las comillas simples
    addwords=addwords.split('"')
    //console.log(addwords)

    //saca el tamaño para el ciclo
    tamanio=addwords.length;

    for(a=0; a<=tamanio; a++){
      //Quitamos los espacios en blanco, por si llega a ver
      addwords[a]=$.trim(addwords[a]);

      //Condicional del nombre del system event
      if(addwords[a]=="<EjbTransaction systemevent="){

        var x = document.getElementById("entrada");
        var t = document.createTextNode('public const string '+addwords[a+1] + '= "'  + ex[1] + '";');
        x.appendChild(t); 

      }

      //Loos campos del system que se van a mapear
      if(addwords[a]=="><Fields><Field name=" || addwords[a]== "/><Field name="){
        if(counter==0){
        $("#campos").empty();
        $("#campos").append("La salida de los campos es la sigiente: "+ addwords[a+5]);
        counter++;
        }
        
        //En el switch dependiendo de tipo de variable entra en la funcion
        switch (addwords[a+3]){
          case "String":
            salidastring(addwords[a+1]);
          break;
          case "Int":
            salidaint(addwords[a+1]);
          break;
          case "Numeric":
            salidaint32(addwords[a+1]);
          break;
          case "Double":
            salidadouble(addwords[a+1]);
          break;
          default:
            //alert("Hola :v error en la palabra: "+p[a]);
          break;
        }
      }

      //Declaracion de las listas y creacion de los textarea correspondientes por cada lista
      if( addwords [ a ] == "/></Fields><Tables><Table name=" || addwords [ a ] == "/></Columns></Table><Table name=" || addwords[ a ] == "><Tables><Table name="){

        //Secrea la pestaña y su funcionamiento
        $("#pestañas").append('<li class="nav-item">'+
                    '<a class="nav-link" id="profile-' + addwords [ a + 1 ] + '" data-idcampo="campo' + addwords [ a + 1 ] + '" data-textatrea="campotl'+ addwords [ a + 1 ] +'" data-toggle="tab" onclick="fnpestaña(this)" href="#profile" role="tab" aria-controls="' + addwords [ a + 1 ] + '" aria-selected="false">' + addwords [ a + 1 ] + '</a>'
                 +' </li>');
        $("#myTabContent").append(' <div class="tab-pane fade" id="pro' + addwords[ a + 1 ] + '" role="tabpanel" aria-labelledby="profile-tab"></div>') 
        
        //Se crea el parrafo y el text area
        $("#cuadros").append('<p id="campotl' + addwords [ a + 1 ] + '" class="prueba" style="margin-top: 20px; text-transform: uppercase;">Dirección: ' + addwords [ a + 3 ] + ' </p> '+
                   '<div id="campotl' + addwords[a+1] + 'btn"></div> '+'<textarea class="form-control noresize tamaño10px pruebax" id="campo'+ addwords[a+1] +'" rows="10" readonly></textarea>');
        liststring(addwords[a+1]);
        b=addwords[a+1];
        variablex.push(a+1)
      
      }
      //variables de las listas con estrada a la funcion de dos parametros la primera el nombre de la variable 
      //que se asigno a la lista, la segunda el nombre de la variable
      if(addwords[a]=="><Columns><Column name=" || addwords[a]=="/><Column name="){
        switch (addwords[a+3]){
          case "String":
            columnastring(addwords[a+1],b);
          break;
          case "Int":
            columnaint(addwords[a+1],b);
          break;
          case "Numeric":
            columnaint32(addwords[a+1],b);
          break;
          case "Double":
            columnadouble(addwords[a+1],b);
          break;
          default:
            //alert("Hola :v error en la palabra: "+p[a]);
          break;
        }
      }
    }
  });

  //Cuando acaba de hacer todo esconde lo que se creo
  $(".pruebax").hide();
  $(".prueba").hide();

  //Mostra de forma predeterminada los campos
  var idx = $("#home-tab").attr('data-idcampo');  
  var id2x = $("#home-tab").attr('data-textatrea');

  $('#'+idx).show();
  $('#'+id2x).show();
    

}

//Funciones para agregar textos en sus correspondientes textareas


//Los campos normales
function salidastring(variable){
  $("#salida").append("public string "+variable+" {get; set;} ")
  $("#salida").append("<p> public string "+variable+" {get; set;} </p>\n");
}
function salidaint(variable){
  $("#salida").append("public int "+variable+" {get; set;} \n")
  $("#salida").append("<p> public int "+variable+" {get; set;} </p>")
}
function salidaint32(variable){
  $("#salida").append("public int "+variable+" {get; set;} \n")
  $("#salida").append("<p> public Int32 "+variable+" {get; set;} </p>")
}
function salidadouble(variable){
  $("#salida").append("public double "+variable+" {get; set;} \n");
  $("#salida").append('<p> public double "'+variable+'" {get; set;} </p>')
}

//Creacion de las listas
function liststring(variable){

  $("#campo"+variable).append("public IList &lt;" + variable + "&gt; "+ variable+" {get; set;} \n");
  $("#campo"+variable).append("<p>public IList &lt;" + variable + "&gt; "+ variable+" {get; set;} </p>");
  
}

//funcion de las variables de las listas
function columnastring(variable, nombre){
  $("#campo"+nombre).append("public string "+variable+" {get; set;} \n");
  $("#campo"+nombre).append("<p >public string "+variable+" {get; set;} </p>");
}
function columnaint(variable, nombre){
  $("#campo"+nombre).append("public int "+variable+" {get; set;} \n");
  $("#campo"+nombre).append("<p >public int "+variable+" {get; set;} </p>");
}
function columnaint32(variable, nombre){
  $("#campo"+nombre).append("public Int32 "+variable+" {get; set;} \n");
  $("#campo"+nombre).append("<p >public Int32 "+variable+" {get; set;} </p>");
}
function columnadouble(variable, nombre){
  $("#campo"+nombre).append("public double "+variable+" {get; set;} \n");
  $("#campo"+nombre).append("<p >public double "+variable+" {get; set;} </p>");
}

//Funcion con la aparicion de del textarea y su descripcion
function fnpestaña(target){

  //Se selecciona los datos con respecto al atributo  que en este caso es el texto y el textarea
  //respectivamente
  var id = $(target).attr('data-idcampo');  
  var id2 = $(target).attr('data-textatrea');

  //se es conden los demas valores
  $(".pruebax").hide();
  $(".prueba").hide();

  //Se muestran los seleccionados
  $('#'+id).show();
  $('#'+id2).show();
  if(id2=="campotlhome"){
    $('#boton').appendTo('#homebtn');
  }
  else{
    $('#boton').appendTo('#'+id2+'btn');
  }

}

//Funcion para copiar el texto por medio del boton
function copiado(){
  $("#secretocopy").empty();
  vx=$("a.active").attr("data-idcampo")
  var ola1=[];
  var aux1=[];
  //console.log($("#"+vx));

  //Cremos un elemento y extaemos los datos que buscamos copiar
  var aux = document.createElement("div");
  aux.setAttribute("contentEditable", true);
  aux.innerHTML = document.getElementById(vx).innerHTML;
  aux.setAttribute("onfocus", "document.execCommand('selectAll' ,false, null)"); 
  r=aux.innerHTML;
  //console.log(r);

  //Partimos por partes separando el parrafo
  r=r.split('<p>');

  //Ciclo para dividir los datos que se buscan y guardalos en otro arreglo 
  for(x=0;x<r.length;x++){
    if(x==0){
      ola1.push(r[x]);
    }
    else{
    ola=r[x].split('</p>');
    ola1.push(ola[1]);
    }
  }
  //Guardamos en un nuevo attrglo los daots que buscamos mas su agregado de parrafos
  for(y=0;y<ola1.length;y++){
    aux1.push("<br>"+ola1[y]);
  }

  //Convertimos en string
  aux2=aux1.toString();
  
  //se quitan los separos en este caso "," en todo el string
  for(z=0;z<ola1.length;z++){
    aux2=aux2.replace(',', '')
  }

  //agregamos el nuevo string
  $("#secretocopy").append(aux2);

  //Copiado del texto deseado
  var aux3 = document.createElement("div");
  aux3.setAttribute("contentEditable", true);
  aux3.innerHTML = document.getElementById("secretocopy").innerHTML;
  aux3.setAttribute("onfocus", "document.execCommand('selectAll',false,null)"); 
  document.body.appendChild(aux3);
  aux3.focus();
  document.execCommand("copy");
  document.body.removeChild(aux3);
  //console.log(aux3)

}