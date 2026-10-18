-- Datos de prueba (idénticos al modo demo). Ejecutar DESPUÉS de 0001_init.sql.
-- Las imágenes apuntan a /demo/... (archivos incluidos en el repo, public/demo).
-- Se puede borrar todo desde el panel o con: delete from public.events where slug in ('navidad-capiovi','pascuas-capiovi','fiesta-rural');
-- La venta de bonos queda DESACTIVADA (hasta configurar Mercado Pago): activarla en Panel > Contenido.

insert into public.events (slug,name,tagline,description,history,location,start_date,end_date,hero_image,logo_url,theme_color,accent_color,phone,email,youtube_url,instagram_url,facebook_url,whatsapp,bonos_enabled,is_published) values ($q$navidad-capiovi$q$,$q$Navidad en Capioví$q$,$q$El pueblo de Papá Noel: toda la magia de la Navidad hecha con botellas recicladas$q$,$q$Navidad en Capioví es una propuesta comunitaria que comienza el primer domingo de Adviento y se extiende hasta fines de enero. Voluntarios de toda la localidad reciclan miles de botellas y materiales para convertirlos en árboles, ángeles, trineos y un pesebre que iluminan la avenida y la plaza.

Los sábados y domingos hay veladas navideñas con espectáculos, feria de artesanos y patio gastronómico.$q$,$q$Navidad en Capioví se viene realizando de forma ininterrumpida desde hace más de 11 años, con el esfuerzo de personas que donan voluntariamente su tiempo y conocimientos. Todo nació de reutilizar botellas descartables para transformarlas en adornos navideños.

2009 – Los inicios

Nació como un proyecto de un grupo de Catequesis Familiar de la Parroquia San Luis Gonzaga, para decorar la Iglesia y sus alrededores. Tomaron como ejemplo actividades similares de Brasil, donde con botellas descartables se elaboran objetos navideños. Fue una manera de mostrar a los niños otra forma de contribuir al desarrollo de su comunidad y de cuidar el medio ambiente. Unas 50 personas voluntarias reutilizaron cerca de 3.000 botellas plásticas, con financiación de los propios vecinos.

2010 – Toda la avenida

Ante la excelente repercusión se sumaron más vecinos. Los adornos abarcaron toda la Avenida San Luis Gonzaga y se agregó un árbol navideño de unos 10 metros en la Plaza Los Pioneros. Se reutilizaron unas 9.000 botellas con unos 80 voluntarios.

2012 – El taller y los arbolitos auspiciados

El grupo empezó a trabajar en un lugar propio para confeccionar los adornos, cedido por el Instituto Nuestra Señora de Itatí. Comercios y familias auspiciaron 28 arbolitos de 3 metros sobre el boulevard. Se reutilizaron unas 14.000 botellas y el grupo llegó a 120 voluntarios.

2013 – El trineo con renos

Se decoraron las farolas de la RN 12 y los edificios públicos. El proyecto más importante fue un trineo con 5 renos a escala real, posible gracias al aporte de tres empresas y de la Municipalidad.

2014 – El tren navideño

Se armaron regalos a la vera de la RN 12, un tren con decoración alegórica, rosetones y esferas grandes. Se utilizaron unas 15.000 botellas.

2015 – El pesebre

Más de 60 auspiciantes ampliaron la iluminación. Se armó el pesebre con la Sagrada Familia y una oveja con más de 16.000 argollas abrochadas.

2016 – El gran árbol

Se construyó un nuevo árbol para la plaza, de unos 14 metros y 10.000 botellas en su follaje. Se realizó un Papá Noel de 4 metros. La decoración del boulevard se extendió a 5 cuadras.

2017 – La casita de Papá Noel

Se armaron 31 casitas de madera decoradas con 30.000 tapitas de gaseosa, con la colaboración de la Escuela N° 14.

2018 – Veladas navideñas

Se sumaron 32 cupcakes iluminados, coronas y una corona de adviento. Desde este año las Veladas Navideñas se realizan sábados y domingos junto a la feria de artesanos y el patio de gastronomía.$q$,$q$Plaza Los Pioneros y Av. San Luis Gonzaga, Capioví$q$,$q$2026-11-29$q$,$q$2027-01-31$q$,$q$/demo/navidad/hero.webp$q$,$q$/demo/navidad/logo.webp$q$,$q$#b91c1c$q$,$q$#166534$q$,$q$03743 493003$q$,null,$q$https://www.youtube.com/watch?v=4SuSRIReQLU$q$,$q$https://instagram.com$q$,$q$https://facebook.com$q$,$q$5493743493003$q$,false,true);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Encendido del árbol y apertura$q$,$q$Plaza Los Pioneros$q$,$q$2026-11-29T20:30:00-03:00$q$,$q$2026-11-29T21:30:00-03:00$q$,$q$Primer domingo de Adviento: se enciende el gran árbol y comienza la Navidad en Capioví.$q$,$q$/demo/navidad/calle-noche.webp$q$);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Banda del Pueblo · Melodías navideñas$q$,$q$Escenario principal$q$,$q$2026-11-29T21:30:00-03:00$q$,$q$2026-11-29T22:30:00-03:00$q$,null,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Ballet Navideño$q$,$q$Escenario principal$q$,$q$2026-12-05T21:00:00-03:00$q$,$q$2026-12-05T22:00:00-03:00$q$,$q$Presentación de las academias de danza de la localidad.$q$,$q$/demo/navidad/ballet.webp$q$);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Coro de la Parroquia San Luis Gonzaga$q$,$q$Escenario principal$q$,$q$2026-12-06T20:00:00-03:00$q$,$q$2026-12-06T21:00:00-03:00$q$,null,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Pesebre viviente$q$,$q$Parroquia San Luis Gonzaga$q$,$q$2026-12-12T21:00:00-03:00$q$,$q$2026-12-12T22:00:00-03:00$q$,$q$Representación con niños y jóvenes de la comunidad.$q$,$q$/demo/navidad/velas-ninos.webp$q$);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Llegada de Papá Noel$q$,$q$Casita de Papá Noel$q$,$q$2026-12-13T19:30:00-03:00$q$,$q$2026-12-13T21:00:00-03:00$q$,$q$Fotos con Papá Noel y entrega de golosinas para los chicos.$q$,$q$/demo/navidad/voluntarios.webp$q$);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Show musical de cierre de año (a confirmar)$q$,$q$Escenario principal$q$,$q$2026-12-19T22:00:00-03:00$q$,null,null,null);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$navidad-capiovi$q$),1,$q$La Parrilla de Don Carlos$q$,$q$Carlos Benítez$q$,array[$q$Choripán $3500$q$,$q$Hamburguesa completa $5000$q$,$q$Bebidas $1500$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$navidad-capiovi$q$),2,$q$Dulces del Monte$q$,$q$Flia. Kraus$q$,array[$q$Strudel $3000$q$,$q$Tortas $2800$q$,$q$Chocolate caliente $1800$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$navidad-capiovi$q$),3,$q$Mbeyú y Más$q$,null,array[$q$Mbeyú $2000$q$,$q$Chipa guazú $2500$q$,$q$Mate cocido $1000$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$navidad-capiovi$q$),4,$q$Pizzería La Plaza$q$,$q$Marcela Duarte$q$,array[$q$Pizza por porción $2500$q$,$q$Empanadas $1200$q$,$q$Gaseosa $1500$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$navidad-capiovi$q$),5,$q$Pan Dulce Casero$q$,$q$Grupo Adultos Mayores$q$,array[$q$Pan dulce $4500$q$,$q$Budín navideño $3000$q$,$q$Café $1200$q$]::text[]);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Ferretería El Tornillo$q$,$q$/demo/ads/ferreteria.svg$q$,$q$Todo para tu hogar y tu obra$q$,0);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Panadería La Espiga$q$,$q$/demo/ads/panaderia.svg$q$,$q$Pan casero y facturas todos los días$q$,1);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Farmacia San Luis$q$,$q$/demo/ads/farmacia.svg$q$,$q$Atención de lunes a domingo$q$,2);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Yerbatera Los Pioneros$q$,$q$/demo/ads/yerbatera.svg$q$,$q$Yerba mate misionera de calidad$q$,3);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Heladería Dulce Selva$q$,$q$/demo/ads/heladeria.svg$q$,$q$Helados artesanales$q$,4);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Corralón Misionero$q$,$q$/demo/ads/corralon.svg$q$,$q$Materiales de construcción$q$,5);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/angeles.webp$q$,$q$Ángeles de botellas recicladas$q$,0);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/calle-noche.webp$q$,$q$La avenida iluminada$q$,1);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/arbol-casitas.webp$q$,$q$Árbol de las casitas$q$,2);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/papa-noel.webp$q$,$q$Papá Noel gigante$q$,3);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/tren.webp$q$,$q$El tren navideño$q$,4);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/pesebre.webp$q$,$q$El pesebre$q$,5);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/regalos.webp$q$,$q$Regalos y árbol de cupcakes$q$,6);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/multitud.webp$q$,$q$La plaza llena de gente$q$,7);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/velas-ninos.webp$q$,$q$Pesebre viviente$q$,8);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/ballet.webp$q$,$q$Ballet navideño$q$,9);
insert into public.gallery_images (event_id,image_url,caption,sort_order) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$/demo/navidad/voluntarios.webp$q$,$q$Papá Noel y voluntarios$q$,10);
insert into public.bono_types (event_id,name,description,amount) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Bono Colaboración$q$,$q$Aporte solidario para sostener el evento$q$,5000);
insert into public.bono_types (event_id,name,description,amount) values ((select id from public.events where slug=$q$navidad-capiovi$q$),$q$Bono Familiar$q$,$q$Para toda la familia$q$,15000);

insert into public.events (slug,name,tagline,description,history,location,start_date,end_date,hero_image,logo_url,theme_color,accent_color,phone,email,youtube_url,instagram_url,facebook_url,whatsapp,bonos_enabled,is_published) values ($q$pascuas-capiovi$q$,$q$Pascuas en Capioví$q$,$q$La Casa de los Conejos, huevos gigantes y feria de artesanos$q$,$q$Con la misma decoración reciclada de Navidad, el pueblo se viste de Pascuas: conejos de 4 metros, huevos gigantes, canastos y la Casa de los Conejos. Hay feria de artesanos, actividades para los chicos y el Vía Crucis.$q$,$q$Dada la gran aceptación de Navidad, en 2016 se decidió decorar el pueblo con motivos de Pascuas, reutilizando la decoración ya armada.

2016 – El primer conejo

Se armó un conejo de 4 metros de altura, huevos y canastos. Se incorporó por primera vez la Feria de Artesanos.

2017 – La Casa de los Conejos

Se confeccionó la coneja, se sumaron huevos de chocolate y más canastos, y se decoró la avenida San Luis Gonzaga con motivos pascuales.

2019 – Huevos gigantes

Se armaron 7 huevos de 2 metros de alto y coronas con huevos chicos para las farolas. Sumó actividades del grupo "Los amigos de las plantas", conejitos reales y el Vía Crucis organizado por la catequesis.$q$,$q$Plaza Los Pioneros, Capioví$q$,$q$2027-03-26$q$,$q$2027-03-28$q$,$q$/demo/rural/pascuas.svg$q$,null,$q$#7c3aed$q$,$q$#db2777$q$,$q$03743 493003$q$,null,null,null,null,$q$5493743493003$q$,false,true);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),$q$Vía Crucis$q$,$q$Parroquia San Luis Gonzaga$q$,$q$2027-03-26T20:00:00-03:00$q$,$q$2027-03-26T21:30:00-03:00$q$,$q$Organizado por el grupo de catequesis.$q$,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),$q$Feria de Artesanos$q$,$q$Plaza Los Pioneros$q$,$q$2027-03-27T16:00:00-03:00$q$,$q$2027-03-27T22:00:00-03:00$q$,null,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),$q$Reparto de dulces en la Casa de los Conejos$q$,$q$Casa de los Conejos$q$,$q$2027-03-28T17:00:00-03:00$q$,$q$2027-03-28T19:00:00-03:00$q$,$q$Para los más chicos, con conejitos reales.$q$,null);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),1,$q$Huevos de Pascua$q$,$q$Chocolatería Artesanal$q$,array[$q$Huevo chico $3500$q$,$q$Huevo grande $9000$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),2,$q$Rosca de Pascua$q$,$q$Panadería del Pueblo$q$,array[$q$Rosca $4000$q$,$q$Café $1200$q$]::text[]);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),$q$Corralón Misionero$q$,$q$/demo/ads/corralon.svg$q$,$q$Materiales de construcción$q$,0);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$pascuas-capiovi$q$),$q$Veterinaria Del Campo$q$,$q$/demo/ads/veterinaria.svg$q$,$q$Cuidamos a tus animales$q$,1);

insert into public.events (slug,name,tagline,description,history,location,start_date,end_date,hero_image,logo_url,theme_color,accent_color,phone,email,youtube_url,instagram_url,facebook_url,whatsapp,bonos_enabled,is_published) values ($q$fiesta-rural$q$,$q$Fiesta Rural$q$,$q$El campo misionero en una sola fiesta$q$,$q$Exposición de productores, destreza criolla, gastronomía regional y shows folklóricos. Un fin de semana para celebrar el trabajo de la tierra y las tradiciones de la comunidad.$q$,null,$q$Predio Rural, Capioví$q$,$q$2027-04-23$q$,$q$2027-04-25$q$,$q$/demo/rural/hero.svg$q$,null,$q$#b45309$q$,$q$#166534$q$,$q$03743 493003$q$,null,null,null,null,$q$5493743493003$q$,false,true);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Apertura y desfile de tropillas$q$,$q$Predio Rural$q$,$q$2027-04-23T18:00:00-03:00$q$,$q$2027-04-23T19:30:00-03:00$q$,null,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Los Hijos de la Tierra$q$,$q$Escenario principal$q$,$q$2027-04-23T21:30:00-03:00$q$,$q$2027-04-23T23:00:00-03:00$q$,$q$Chamamé y folklore misionero.$q$,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Jineteada y destreza criolla$q$,$q$Playón$q$,$q$2027-04-24T15:00:00-03:00$q$,$q$2027-04-24T19:00:00-03:00$q$,null,null);
insert into public.schedule_items (event_id,artist,stage,starts_at,ends_at,description,image_url) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Noche de peña$q$,$q$Escenario principal$q$,$q$2027-04-24T22:00:00-03:00$q$,null,null,null);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$fiesta-rural$q$),1,$q$Asado al Asador$q$,$q$Club Rural$q$,array[$q$Costillar con ensalada $9000$q$,$q$Chorizo $3000$q$]::text[]);
insert into public.food_stalls (event_id,number,name,owner,products) values ((select id from public.events where slug=$q$fiesta-rural$q$),2,$q$Cocina Criolla$q$,$q$Mujeres Rurales$q$,array[$q$Locro $4500$q$,$q$Empanadas $1200$q$,$q$Sopa paraguaya $2000$q$]::text[]);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Corralón Misionero$q$,$q$/demo/ads/corralon.svg$q$,$q$Materiales de construcción$q$,0);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Veterinaria Del Campo$q$,$q$/demo/ads/veterinaria.svg$q$,$q$Cuidamos a tus animales$q$,1);
insert into public.ads (event_id,business_name,image_url,description,sort_order) values ((select id from public.events where slug=$q$fiesta-rural$q$),$q$Yerbatera Los Pioneros$q$,$q$/demo/ads/yerbatera.svg$q$,$q$Yerba mate misionera de calidad$q$,2);

