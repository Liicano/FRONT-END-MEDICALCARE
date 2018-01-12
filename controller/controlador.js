var app = angular.module("MedicalCare", ["ngRoute", "ngCookies", "ui.bootstrap"]);

app.config(function($routeProvider, $httpProvider) {
    $routeProvider
     .when("/", {
        templateUrl : "./views/home.html",
        controller: "homeCtrl"
    })
    .when("/login", {
        templateUrl : "./views/login.html",
        controller: "loginCtrl"
    })
    .when("/equipos", {
        templateUrl : "./views/equipos.html",
        controller: "equiposCtrl"
    })
    .when("/recuperar_password", {
        templateUrl : "./views/recuperar_password.html",
        controller: "recoverPassCtrl"
    })
    .when("/reportes", {
        templateUrl : "./views/reportes.html",
        controller: "reportesCtrl"
    })
    .when("/perfil", {
        templateUrl : "./views/perfil.html",
        controller: "perfilCtrl"
    })
    .when("/usuarios", {
        templateUrl : "./views/usuarios.html",
        controller: "usuariosCtrl"
    })
    .when("/home", {
        templateUrl : "./views/home.html",
        controller: "homeCtrl"
    });


});

//factoria que controla la autentificación, devuelve un objeto
//$cookies para crear cookies
//$cookieStore para actualizar o eliminar
//$location para cargar otras rutas
app.factory("auth", function($cookies,$cookieStore,$location, $http){
    return{
        login : function(Cedula, Password){
        $http({
          method: 'POST',
          url: 'http://localhost:3000/login',
          data:{cedula: Cedula, password: Password}
        }).then(function successCallback(data, status) {    
            if (!data.data.Check && data.data.usuario == null) toastr.error('Usuario no encontrado');
            if (!data.data.Check && data.data.usuario) toastr.error('Contraseña incorrecta');
            //Si el usuario se logea correctamente...
            if ( data.data.Check  && data.data.usuario != null){
            $cookies.putObject('usuario',{'cedula':data.data.usuario.cedula,'nombre':data.data.usuario.nombre, 'apellido':data.data.usuario.apellido, 'cargo':data.data.usuario.cargo, 'nivel':data.data.usuario.nivel});
            if (Cedula !='' && Password != ''){ $location.path("/home");}else{alert("USUARIO O CONTRASEÑA VACIOS");}
           
            } 
            
        });

        },
        logout : function(){
            //al hacer logout eliminamos la cookie con $cookieStore.remove
            $cookieStore.remove("usuario"),
            //mandamos al login
            $location.path("/login");
        },
        checkStatus : function(){
            
            var RutasLogin = ['/home','/reportes','/usuarios','/equipos', '/perfil'];
            if(typeof($cookies.getObject('usuario')) == "undefined")
            {
                $location.path("/login");
            }
           
            if(this.in_array("/login",RutasLogin) && typeof($cookies.getObject('usuario')) != "undefined")
            {
                $location.path("/home");
            }   


        },
        in_array : function(needle, haystack){
            var key = '';
            for(key in haystack)
            {
                if(haystack[key] == needle)
                {
                    return true;
                }
            }
            return false;
        }
    }
});


//CONTROLADOR DEL LOGIN
app.controller('loginCtrl', ['$scope','$http', 'auth', function($scope, $http, auth){
$scope.login = function(){ 
    auth.login($scope.cedula, $scope.password); 
}
}]);


//CONTROLADOR DE EQUIPOS
app.controller('equiposCtrl', ['$scope', '$cookies', '$location', '$http', 'auth', function($scope, $cookies,$location, $http, auth){
 //Datos de la session
 $scope.usuario = $cookies.getObject('usuario');
    console.log($scope.usuario);
    //Variable para mostrar elementos dependiendo del tipo de usuario
    if ($cookies.getObject('usuario').nivel == 1) $scope.isDirector = true;
    //la función logout que llamamos en la vista llama a la función
    //logout de la factoria auth
    $scope.logout = function(){
    auth.logout();
    }

//Controller
$http.get("http://localhost:3000/equipos")
.then(function(response) {
//FOR PARA SÉPARAR LOS LABELS
$scope.equipo = []; 
angular.copy(response.data, $scope.equipo);
var clase = '';
var nombreLabel = '';
//VER EQUIPOS CUANDO SE ABRE LA PAGINA
for (var i = 0; i < $scope.equipo.length; i++) {
$scope.equipo[i].Label = [];
if ($scope.equipo[i].status == 'disponible')  {clase = "label label-success"; nombreLabel = "DISPONIBLE"; $scope.equipo[i].Label.push({Label: nombreLabel, claseLabel:clase});}
else if ($scope.equipo[i].status == 'mantenimiento')  {clase = "label label-warning"; nombreLabel = "MANTENIMIENTO"; $scope.equipo[i].Label.push({Label: nombreLabel, claseLabel:clase});}
else if ($scope.equipo[i].status == 'fuera de servicio')  {clase = "label label-danger"; nombreLabel = "FUERA DE SERVICIO"; $scope.equipo[i].Label.push({Label: nombreLabel, claseLabel:clase});}
};
console.log($scope.equipo);    
});

//REGISTRAR EQUIPO
$scope.RegistrarEquipo = function(Codigo, Nombre, Modelo, Descripcion, Ubicacion, Proveedor, FechaIngreso){
var data = {
    codigo:Codigo,
    ubicacion:Ubicacion,
    nombre:Nombre,
    descripcion:Descripcion,
    modelo:Modelo,
    fecha_compra:FechaIngreso,
    proveedor:Proveedor,
    status:'disponible'
}
$http.post('http://localhost:3000/equipos', data)
.then(function(response) {
    toastr.success('Equipo registrado con exito');
    $route.reload();
});
}


//CAMBIAR ESTATUS DE UN EQUIPO
$scope.BuscarEquipo = function(codigo){
$http.get("http://localhost:3000/equipo/" + codigo)
.then(function(response) {
    console.log(response.data);

    if (response.data == null) {
        $scope.Err = true;
        $scope.ErrMsg = '¡Equipo no encontrado!'; 
    };

    $scope.NombreEquipo = response.data.nombre;
    $scope.ModeloEquipo = response.data.modelo;
});
}

$scope.CambiarStatus = function(codigo, newStatus){
console.log("codigoi -> ",codigo);
console.log("Status -> ",newStatus);


$http.get("http://localhost:3000/equipo/" + codigo)
.then(function(response) {
    console.log(response.data);
    
//HACIENDO PUT DE CAMBIO
var data = {
    codigo:response.data.codigo,
    ubicacion:response.data.ubicacion,
    nombre:response.data.nombre,
    descripcion:response.data.descripcion,
    modelo:response.data.modelo,
    fecha_compra:response.data.fecha_compra,
    proveedor:response.data.proveedor,
    status: newStatus
}

$http.put('http://localhost:3000/equipo/' + codigo, data)
.then(function(response){
     console.log("RESPONSE DEL PUT -> ",response.data);
     toastr.success('¡Equipo modificado con exito!');
});
});
}

}]);


//CONTROLADOR DEL HOME
app.controller('homeCtrl', function($scope, $http, $cookies, auth){
    $scope.usuario = $cookies.getObject('usuario');
    console.log($scope.usuario);
    //Variable para mostrar elementos dependiendo del tipo de usuario
    if ($cookies.getObject('usuario').nivel == 1) $scope.isDirector = true;
    //la función logout que llamamos en la vista llama a la función
    //logout de la factoria auth
    $scope.logout = function(){
    auth.logout();
    }
 
 //CONTROLLER
 //Widgets de equipos.
$http.get("http://localhost:3000/equipos")
.then(function(response) {
$scope.Disponibles = [];
$scope.Mantenimiento = [];
$scope.FueraServicio = [];
for (var i = 0; i < response.data.length; i++) {
       if (response.data[i].status == 'disponible') $scope.Disponibles.push(response.data[i]);
       if (response.data[i].status  == 'mantenimiento') $scope.Mantenimiento.push(response.data[i]);
       if (response.data[i].status  == 'fuera de servicio') $scope.FueraServicio.push(response.data[i]);
    }
//Colocando equipos en el buscador del rigthbar
$scope.equipos = [],
angular.copy(response.data, $scope.equipos);

for (var i = 0; i < $scope.equipos.length; i++) {
$scope.equipos[i].Label = [];
if ($scope.equipos[i].status == 'disponible')  {clase = "circle circle-success circle-lg"; $scope.equipos[i].Label.push(clase);}
else if ($scope.equipos[i].status == 'mantenimiento')  {clase = "circle circle-warning circle-lg"; $scope.equipos[i].Label.push(clase);}
else if ($scope.equipos[i].status == 'fuera de servicio')  {clase = "circle circle-danger circle-lg"; $scope.equipos[i].Label.push(clase);}
};
});
});

app.controller('reportesCtrl', ['$scope','$cookies', '$http', 'auth', function($scope,$cookies, $http, auth){
//Datos de la session
 $scope.usuario = $cookies.getObject('usuario');
    console.log($scope.usuario);
    //Variable para mostrar elementos dependiendo del tipo de usuario
    if ($cookies.getObject('usuario').nivel == 1) $scope.isDirector = true;
    //la función logout que llamamos en la vista llama a la función
    //logout de la factoria auth
    $scope.logout = function(){auth.logout();}


    var docDefinition = {
      content: [
        {
          text: 'PRODUCTOS DISPONIBLES'
        },
        {
          style: 'demoTable',
          table: {
            widths: ['*', '*', '*','*', '*', '*'],
            body: [
            [  {text: 'CODIGO', style: 'header'}, 
               {text: 'NOMBRE', style: 'header'},
               {text: 'MODELO', style: 'header'},
               {text: 'CODIGO', style: 'header'}, 
               {text: 'NOMBRE', style: 'header'},
               {text: 'MODELO', style: 'header'}
            ],
              ['Sachin', '344', '52'],
              ['Sanga', '320', '89'],
              ['Ponting', '300', '68'],
              ['Sachin', '344', '52'],
              ['Sanga', '320', '89'],
              ['Ponting', '300', '68'] 
            ]
          }
        }
      ],
      styles: {
        header: {
          bold: true,
          color: '#000',
          fontSize: 11
        },
        demoTable: {
          color: '#666',
          fontSize: 10
        }
      }
    };

    $scope.openPdf = function() {
      pdfMake.createPdf(docDefinition).open();
    };

    $scope.downloadPdf = function() {
      pdfMake.createPdf(docDefinition).download();
    };
  

}]);

//CONTROLADOR DEL PERFIL
app.controller('perfilCtrl', function($scope, $cookies, auth){
    $scope.usuario = $cookies.getObject('usuario');
    console.log($scope.usuario);
    //Variable para mostrar elementos dependiendo del tipo de usuario
    if ($cookies.getObject('usuario').nivel == 1) $scope.isDirector = true;
    //la función logout que llamamos en la vista llama a la función
    //logout de la factoria auth
    $scope.logout = function(){
    auth.logout();
    }
 
//CONTROL



});


app.controller('usuariosCtrl', function($scope, $cookies,$http, auth){
    $scope.usuario = $cookies.getObject('usuario');
    console.log($scope.usuario);
    //Variable para mostrar elementos dependiendo del tipo de usuario
    if ($cookies.getObject('usuario').nivel == 1) $scope.isDirector = true;
    //la función logout que llamamos en la vista llama a la función
    //logout de la factoria auth
    $scope.logout = function(){
    auth.logout();
    }
 
//LLENANDO TABLA DE ULTIMOS USUARIOS REGISTRADOS
$http.get('http://localhost:3000/usuarios')
.then(function(response) {
    console.log(response.data);
    $scope.usuarios = [];
    angular.copy(response.data, $scope.usuarios);
});

//REGISTRAR UN NUEVO USUARIO
$scope.newUser = function(cedula, password, nombre, apellido, cargo, correo, telefono){
    var nivel = 1;
//console.log(cedula, password, nombre, apellido, cargo, correo, telefono, nivel);
var data = {
cedula:cedula,
password:password,
nombre:nombre,
apellido:apellido,
cargo:cargo,
correo:correo,
telefono:telefono,
nivel: nivel
}
$http.post('http://localhost:3000/usuarios', data)
.then(function(response) {
    toastr.success('¡Usuario registrado con exito!');
});
}


//BUSCAR USUARIO PARA EDITAR
$scope.findUser = function(cedula){
$http.get('http://localhost:3000/usuario/' + cedula)
.then(function(response) {
    //VARIABLES LLAMADAS DEL USUARIO ( BY: CEDULA)

    if (response.data.nivel != 1) {
    $scope.cedula   = response.data.cedula;
    $scope.password = response.data.password;
    $scope.nombre   = response.data.nombre;
    $scope.apellido = response.data.apellido;
    $scope.cargo    = response.data.cargo;
    $scope.correo   = response.data.correo;
    $scope.telefono = response.data.telefono;
    $scope.nivel    = response.data.nivel;
    $scope.Attr = '';
}else{
    $scope.cedula   = 'ADMINISTRADOR';
    $scope.password = 'ADMINISTRADOR';
    $scope.nombre   = response.data.nombre;
    $scope.apellido = response.data.apellido;
    $scope.cargo    = 'ADMINISTRADOR';
    $scope.correo   = 'ADMINISTRADOR';
    $scope.telefono = 'ADMINISTRADOR';
    $scope.nivel    = 'ADMINISTRADOR';
    $scope.Attr = 'none';
    toastr.danger('NO PUEDE EDITAR A UN ADMINISTRADOR');
}

$scope.ModifiUser = function(cedula){

var data = {
    cedula   :  $scope.cedula,  
    password :  $scope.password,
    nombre   :  $scope.nombre,  
    apellido :  $scope.apellido,
    cargo    :  $scope.cargo,   
    correo   :  $scope.correo,  
    telefono :  $scope.telefono,
    nivel    :  $scope.nivel   
}
$http.put('http://localhost:3000/usuario/' + cedula, data)
.then(function(response) {
    console.log(response.data);
    toastr.success('¡Usuario modificado con exito!');
});
}
});
}

//BUSCAR USUARIO PARA EDITAR
$scope.findUserAndDelete = function(cedula){
$http.get('http://localhost:3000/usuario/' + cedula)
.then(function(response) {
    //VARIABLES LLAMADAS DEL USUARIO ( BY: CEDULA)

    if (response.data.nivel != 1) {
    $scope.nombre   = response.data.nombre;
    $scope.apellido = response.data.apellido;
    $scope.correo   = response.data.correo;
    $scope.telefono = response.data.telefono;
    $scope.Attr = '';
}else{
    $scope.nombre   =  response.data.nombre;
    $scope.apellido = response.data.apellido;
    $scope.correo   = 'ADMINISTRADOR';
    $scope.telefono = 'ADMINISTRADOR';
    $scope.Attr = 'none';
    toastr.danger('NO PUEDE ELIMINAR A UN ADMINISTRADOR');
}

$scope.deleteUser = function(cedula){
$http.delete('http://localhost:3000/usuario/' + cedula)
.then(function(response) {
    console.log(response.data);
    toastr.success('¡Usuario eliminado con exito!');
});
}
});
}

});

app.controller('recoverPassCtrl', ['$scope', '$cookies', '$http', 'auth', function($scope, $cookies, $http, auth){

}]);



//APP RUN (CHECK QUE EL USUARIO ESTE LOGEEADO CADA VEZ QUE SE CAMBIA UNA VISTA Y QUE ESTE TENGA ACCESO A LA MISMA)
/*app.run(function($rootScope, auth)
{
    //al cambiar de rutas
    $rootScope.$on('$routeChangeStart', function(){
       
       auth.checkStatus();
    })
})
*/
