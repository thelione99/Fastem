-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versione server:              10.4.32-MariaDB - mariadb.org binary distribution
-- S.O. server:                  Win64
-- HeidiSQL Versione:            12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dump della struttura del database test
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `test`;

-- Dump della struttura di tabella test.guests
CREATE TABLE IF NOT EXISTS `guests` (
  `id` varchar(36) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `instagram` varchar(255) NOT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `qrCode` varchar(255) DEFAULT NULL,
  `isUsed` tinyint(1) DEFAULT 0,
  `usedAt` bigint(20) DEFAULT NULL,
  `createdAt` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dump dei dati della tabella test.guests: ~110 rows (circa)
INSERT INTO `guests` (`id`, `firstName`, `lastName`, `email`, `instagram`, `status`, `qrCode`, `isUsed`, `usedAt`, `createdAt`) VALUES
	('001665b2-e071-4bd3-bd54-49ec217498d9', 'Erica ', 'Zecca ', 'ericazecca4@gmail.com', 'ericaazecca', 'APPROVED', '001665b2-e071-4bd3-bd54-49ec217498d9', 0, NULL, 1765385015277),
	('04877748-60fd-47e0-8ebe-b3120de6f71f', 'anita', 'costanzo', 'anitapiacostanzo@icloud.com', 'anita.costanzoo', 'APPROVED', '04877748-60fd-47e0-8ebe-b3120de6f71f', 0, NULL, 1765385922863),
	('0489fa3f-abdf-41ff-b0b3-e8bce2d8669f', 'Teresa', 'Marroccella', 'terrymia05@gmail', 'teresa.marroccella_', 'APPROVED', '0489fa3f-abdf-41ff-b0b3-e8bce2d8669f', 0, NULL, 1765544889857),
	('06704120-144d-4c65-9998-a606c233117c', 'Alessia ', 'Di Gabriele ', 'alessiadigabriele8@gmail.com', 'alessiadigabriele', 'APPROVED', '06704120-144d-4c65-9998-a606c233117c', 0, NULL, 1765372630967),
	('090731a8-7cbd-4b6b-bba7-560b7b90067b', 'Sara', 'Antonelli', 'saraantonelli45@gmail.com', 'saraantonelli___', 'APPROVED', '090731a8-7cbd-4b6b-bba7-560b7b90067b', 0, NULL, 1765461535429),
	('09952c07-e934-427e-b086-faaa3a94bc78', 'Giuseppe', 'Faccenda', 'peppefaccenda10@gmail.com', 'peppefaccenda_', 'PENDING', NULL, 0, NULL, 1765630776552),
	('09fc253c-90b4-4a63-9188-65e54ee9eaf6', 'Daniela ', 'Cavallo', 'danielacavallo117@gmail.com', 'danielaacavallo', 'APPROVED', '09fc253c-90b4-4a63-9188-65e54ee9eaf6', 0, NULL, 1765390975094),
	('0b39c118-479c-4991-adba-8a483bd16ba1', 'Adolfo', 'Fregola', 'fregolaadolfo@gmail.com', 'adolfo_fregola', 'PENDING', NULL, 0, NULL, 1765413676973),
	('0bd63176-1a12-4fd1-ba3d-ce8a2c9dc4eb', 'Pasquale', 'Chianese', 'pasquale130802@gmail.com', '_pasquale.chianese_', 'PENDING', NULL, 0, NULL, 1765642065027),
	('125f07ed-753f-42f2-b86d-8ac2fa272b13', 'Nicola', 'Cicala', 'nicola08c@icloud.com', '_nicolacicala_', 'APPROVED', '125f07ed-753f-42f2-b86d-8ac2fa272b13', 0, NULL, 1765395520396),
	('12ebc326-775d-4ab8-b814-cd51f5a63cf9', 'mario', 'franzese', 'mariofranzese70@gmail.com', 'mario_franzese_', 'PENDING', NULL, 0, NULL, 1765406678549),
	('165dd737-7417-4f01-a53e-6d70c7febd07', 'Enzo', 'Anatriello', 'enzoanatriello2012@gmail.com', 'enzo_anatriello_', 'APPROVED', '165dd737-7417-4f01-a53e-6d70c7febd07', 0, NULL, 1765359623931),
	('179764a0-1b71-45f1-94fe-15c9f5559772', 'Armando ', 'Abatiello', 'mandinhodobrasa@gmail.com', 'armando_abatiello', 'APPROVED', '179764a0-1b71-45f1-94fe-15c9f5559772', 0, NULL, 1765393048914),
	('18a5eff0-4d35-42f2-8a30-f7c3aa85c16b', 'Gregorio', 'Gondola', 'gregoriogondola07@gmail.com', 'gregoriogondola_', 'APPROVED', '18a5eff0-4d35-42f2-8a30-f7c3aa85c16b', 0, NULL, 1765332675567),
	('1c4ae81d-1f13-45ec-8742-b590af5547bf', 'Giuseppe', 'Garofalo', 'peppegaro03@gmail.com', 'giuseppe.garofalo_', 'PENDING', NULL, 0, NULL, 1765413526492),
	('1eadeab6-aa9f-41cc-85cf-c0a8559f732e', 'Susy', 'Paciolla ', 'susypaciolla002@gmail.com', 'susy_paciolla', 'APPROVED', '1eadeab6-aa9f-41cc-85cf-c0a8559f732e', 0, NULL, 1765377129060),
	('236ca12e-23a5-47ac-a463-3e9c5afa3107', 'rosy', 'rasulo', 'rosyrasulo@gmail.com', 'rosy.rasulo', 'APPROVED', '236ca12e-23a5-47ac-a463-3e9c5afa3107', 0, NULL, 1765377084877),
	('27174fe0-6486-447b-8c0d-5951026a0930', 'Giovanni', 'Cristiano', 'giovi.cristiano06@gmail.com', 'giovannicristiano____', 'APPROVED', '27174fe0-6486-447b-8c0d-5951026a0930', 0, NULL, 1765380712867),
	('28df4fd0-869a-44dc-bd3f-fc25d34c3099', 'chiara', 'conte', 'chiaraconte2010@icloud.com', '_chiaraconteee', 'APPROVED', '28df4fd0-869a-44dc-bd3f-fc25d34c3099', 0, NULL, 1765385738100),
	('2999b650-02d5-44d8-a144-91bb3a051428', 'Nicola ', 'Fimiani ', 'fimianinicola45@gmail.com', 'nicolo_fimiani', 'APPROVED', '2999b650-02d5-44d8-a144-91bb3a051428', 0, NULL, 1765373250725),
	('2cc69183-4337-4f2b-bec1-62add545d7c4', 'Flora', 'Alborino', 'floraalborino67@gmail.com', 'flora.alborinoo', 'APPROVED', '2cc69183-4337-4f2b-bec1-62add545d7c4', 0, NULL, 1765377007380),
	('2dbfb0d4-dd90-4e61-9375-18fd98ff6ac1', 'Elena ', 'Vitale', 'elenavitale005@gmail.com', '_elenavitale_', 'APPROVED', '2dbfb0d4-dd90-4e61-9375-18fd98ff6ac1', 0, NULL, 1765634499926),
	('2f91e701-4089-4955-b857-858e38cc8578', 'Sabrina', 'Pisano', 'pisanosabrina676@gmail.com', 'sabrinapisanoo_', 'REJECTED', NULL, 0, NULL, 1765439168532),
	('31bec325-c482-4c7a-b029-19168fb53419', 'Alessandro', 'Russo', 'ale.mattia72@gmail.com', '_alessandrorusso4_', 'PENDING', NULL, 0, NULL, 1765413664116),
	('333eaf89-4ebe-4325-a886-c499eb9c03fc', 'Viviana', 'Crescenzi', 'vivianacrescenzi@gmail.com', '_imvyvy_', 'APPROVED', '333eaf89-4ebe-4325-a886-c499eb9c03fc', 0, NULL, 1765488622422),
	('33b336ca-f3a7-46bb-959f-e228ce5d0ca8', 'Maria', 'Cammisa', 'mariacammisa749@gmail.com', 'maria_cammisa__', 'APPROVED', '33b336ca-f3a7-46bb-959f-e228ce5d0ca8', 0, NULL, 1765447862634),
	('33fd6b85-ad47-44d4-92e9-1f9ae9aa036c', 'Marta', 'Barbato', 'martabarbato16@gmail.com', 'martabarbato__', 'APPROVED', '33fd6b85-ad47-44d4-92e9-1f9ae9aa036c', 0, NULL, 1765388843672),
	('37b69cc0-b0a6-4791-bd3f-c9b8a111a4de', 'Alessandro', 'Chiatto ', 'Alessandrochiatto09@gmail.com', 'Alessandrochiatto_', 'APPROVED', '37b69cc0-b0a6-4791-bd3f-c9b8a111a4de', 0, NULL, 1765386460838),
	('495fcc28-7a01-4ebe-9ffc-754f2d2acf86', 'Maria Chiara', 'Falco', 'mariachiara.falcor@libero.it', 'mariachiarafalco_', 'APPROVED', '495fcc28-7a01-4ebe-9ffc-754f2d2acf86', 0, NULL, 1765384976661),
	('4f0f024e-6ccc-434e-bbed-410bcd3ba5f3', 'Alessia ', 'Vittorioso ', 'vittoriosoalessia94@gmail.com', 'alessiaaa_vittorioso ', 'APPROVED', '4f0f024e-6ccc-434e-bbed-410bcd3ba5f3', 0, NULL, 1765632933519),
	('4fd3d440-6bc8-40aa-bb8e-3d6e87f2897f', 'Flavia ', 'De Luca', 'flaviadelucaa@gmail.com', 'flaavia.deluca ', 'APPROVED', '4fd3d440-6bc8-40aa-bb8e-3d6e87f2897f', 0, NULL, 1765377110925),
	('51a293aa-9b9c-4770-a72a-d29e9f9cb8fb', 'Cristofer ', 'Bosfa', 'bosfacristofer2002@gmail.com', 'Cristofer_bosfa', 'APPROVED', '51a293aa-9b9c-4770-a72a-d29e9f9cb8fb', 0, NULL, 1765364228888),
	('51fce0a7-22dd-49cc-8abf-0665d8e2cb35', 'Valentina', 'Cesaro', 'valentina.cesaro2019@gmail.com', '_valentinacesaro', 'APPROVED', '51fce0a7-22dd-49cc-8abf-0665d8e2cb35', 0, NULL, 1765443342149),
	('52aceb1c-14e9-4fa0-9efa-92aa5370e7fa', 'claudia ', 'tavormina ', 'cla999tavormina@gmail.com', 'claudiatavormina_', 'APPROVED', '52aceb1c-14e9-4fa0-9efa-92aa5370e7fa', 0, NULL, 1765629941329),
	('5a2ac176-8b24-48aa-ac27-1f64ba8dfca2', 'Francesca', 'Cristallo', 'francescacristallo37@gmail.com', '__effecristallo__', 'APPROVED', '5a2ac176-8b24-48aa-ac27-1f64ba8dfca2', 0, NULL, 1765488557796),
	('5e0c71cb-0dee-470c-a1a7-fc48598d85b6', 'Sara', 'Capone', 'caponesara8@gmail.com', 'saracapone._', 'APPROVED', '5e0c71cb-0dee-470c-a1a7-fc48598d85b6', 0, NULL, 1765381624198),
	('5ee8ff10-6d6e-4859-8c5d-30c617a5d744', 'Diego ', 'Ganzerli ', 'diejacganz@gmail.com', 'diegoganzerli_17', 'REJECTED', NULL, 0, NULL, 1765467807208),
	('60326f20-3554-4156-90c3-550736479d36', 'claudio ', 'grimaldi ', 'claudiogrimaldi2019@gmail.com', 'claudiogrimaldi_10', 'APPROVED', '60326f20-3554-4156-90c3-550736479d36', 0, NULL, 1765392468159),
	('60a49693-b9bf-403e-870e-d79ad2f38b0f', 'Daniele ', 'Giordano ', 'dany.giordano07@gmail.com', '_giordanodaniele_', 'APPROVED', '60a49693-b9bf-403e-870e-d79ad2f38b0f', 0, NULL, 1765400347778),
	('622963a9-e6cf-4e64-b030-cb5c6742371b', 'Angelo', 'Sorgente ', 'angelo.sorgente007@gmsil.com', 'angelo_sorgente_', 'REJECTED', NULL, 0, NULL, 1765375472052),
	('624c86cc-8ecd-48d8-9250-8863286bec19', 'Wanda', 'Cirillo', 'wandacirillo2@gmail.com', 'wanda.cirillo', 'APPROVED', '624c86cc-8ecd-48d8-9250-8863286bec19', 0, NULL, 1765628344901),
	('63037cd5-b14d-45c0-898b-40e3401a355c', 'daniele', 'cristiano', 'danielezeroquattro@gmail.com', 'holy_dan_', 'REJECTED', NULL, 0, NULL, 1765628499850),
	('6663429f-9d35-44c3-94c8-abfccd7b03a9', 'Marco', 'Cirillo', 'mcirillo394@gmail.com', 'cirillomarco_', 'APPROVED', '6663429f-9d35-44c3-94c8-abfccd7b03a9', 0, NULL, 1765396863037),
	('66ad619f-ea38-4654-b9a1-d514e31d0276', 'Rocco', 'Saviano ', 'roccosaviano430@gmail.com', 'roccoo_saviano', 'APPROVED', '66ad619f-ea38-4654-b9a1-d514e31d0276', 0, NULL, 1765374617049),
	('6899fc56-cd64-48dd-8fb5-d21396481e52', 'Daniele', 'Puzio', 'daniele.puzio0209@gmail.com', '@danielepuzio_', 'APPROVED', '6899fc56-cd64-48dd-8fb5-d21396481e52', 0, NULL, 1765627930049),
	('6a33350e-ac28-4c43-a2e5-91c196873478', 'Dolores ', 'Perfetto', 'doloresperfetto11@gmail.com', 'dolores_perfetto', 'APPROVED', '6a33350e-ac28-4c43-a2e5-91c196873478', 0, NULL, 1765359518074),
	('6c104b10-6590-4a98-aeb9-ec77d5202b6a', 'emanuele', 'giordano', 'giordanomanu80@gmail.com', '_emanuelegiordano_', 'PENDING', NULL, 0, NULL, 1765634215389),
	('6c84001c-0205-4617-a13d-4df438f785f1', 'Hassana', 'Zabre ', 'zabrehassana25@gmail.com', 'im.hassy_', 'APPROVED', '6c84001c-0205-4617-a13d-4df438f785f1', 0, NULL, 1765388119734),
	('6ded9703-93e0-41c0-bf1a-d772009f3d7d', 'aurora', 'vitale', 'auroravitalecorsof@gmail.com', 'auroravitale__', 'APPROVED', '6ded9703-93e0-41c0-bf1a-d772009f3d7d', 0, NULL, 1765445062393),
	('70d13f7c-145c-4001-91c4-1d58c1861cfc', 'Alessandro', 'D\'errico', 'alexderrico2006@gmail.com', 'alessandroderrico__', 'APPROVED', '70d13f7c-145c-4001-91c4-1d58c1861cfc', 0, NULL, 1765532756626),
	('7344dff1-af97-4458-9363-d42324571ad6', 'Sara', 'Russiello', 'sararussi06@gmail.com', '@_sara.russiello', 'APPROVED', '7344dff1-af97-4458-9363-d42324571ad6', 0, NULL, 1765375307528),
	('75a38046-7e9f-456d-aad8-353bc89d7c43', 'Matteo', 'Pollasto', 'matteopollasto@gmail.com', '@matteopollasto_', 'APPROVED', '75a38046-7e9f-456d-aad8-353bc89d7c43', 0, NULL, 1765387940873),
	('784f8fd5-8175-4fea-bd2c-1217c3172c98', 'raffaele', 'gervasio', 'raffaelegervasio11@gmail.com', '_raffaelegervasio_', 'PENDING', NULL, 0, NULL, 1765632073489),
	('78c71a41-9bc9-47c1-a51e-bd8a3d7cd500', 'chiara ', 'giordano ', 'giordanoc399@gmail.com', 'chiara._giordano ', 'APPROVED', '78c71a41-9bc9-47c1-a51e-bd8a3d7cd500', 0, NULL, 1765381788397),
	('7c03e79f-c0cc-41a4-bc1c-af0b12db9fd7', 'simone', 'vergara', 'simonevergara8@gmail.com', 'simonevergara_', 'PENDING', NULL, 0, NULL, 1765623049548),
	('7e3a0157-8b7d-43e0-a5bc-1818bc00afd7', 'Luigi', 'Chiacchio', 'luigichiacchio34@gmail.com', 'luigi.gallery', 'APPROVED', '7e3a0157-8b7d-43e0-a5bc-1818bc00afd7', 0, NULL, 1765365920189),
	('80a3e2e5-6ef5-4a8f-81e1-35e5dcbec788', 'Adriana', 'Sepe', 'adrianasepe79@gmail.com', 'adrianasepe_', 'APPROVED', '80a3e2e5-6ef5-4a8f-81e1-35e5dcbec788', 0, NULL, 1765372873238),
	('8208af81-6a02-4ffb-93ff-a3fd01b007f3', 'Luigi ', 'Mazza', 'luigimazza0507@gmail.com', '_luigimazza', 'APPROVED', '8208af81-6a02-4ffb-93ff-a3fd01b007f3', 0, NULL, 1765491507808),
	('85349054-3279-4241-9c97-db64db97b855', 'Angelo', 'sorgente', 'angelo.sorgente007@gmail.com', 'angelo_sorgente_', 'REJECTED', NULL, 0, NULL, 1765379672051),
	('8753f209-05fe-45d7-b609-8350691a45b0', 'Giulia', 'Spens', 'spenagiulia2@gmail.com', 'giuliaspenaa', 'APPROVED', '8753f209-05fe-45d7-b609-8350691a45b0', 0, NULL, 1765395603251),
	('87ea7a8c-83b2-458e-9ad4-f828d83f11c2', 'Simone', 'Cirillo', 'simonecirillo05@gmail.com', 'simonecirillo_', 'APPROVED', '87ea7a8c-83b2-458e-9ad4-f828d83f11c2', 0, NULL, 1765475128245),
	('8e743235-37e6-4ab2-82d8-d49a0e7038e5', 'Giovanni ', 'Liguori ', 'giovanni.liguori1@icloud.com', 'giovi_liguori', 'APPROVED', '8e743235-37e6-4ab2-82d8-d49a0e7038e5', 0, NULL, 1765468905309),
	('8f566351-fd20-4788-8509-da8640e0e10b', 'greta', 'cristiano ', 'gretacristiano11@icloud.com', 'gretacristiano', 'APPROVED', '8f566351-fd20-4788-8509-da8640e0e10b', 0, NULL, 1765375040289),
	('90e712a8-4a7d-4ed5-86e0-538169504ddf', 'Carlotta ', 'Conte ', 'carlottaconte05@gmail.com', 'carlotta___conte', 'APPROVED', '90e712a8-4a7d-4ed5-86e0-538169504ddf', 0, NULL, 1765378614003),
	('935951fd-c327-4a65-88ef-47e3df7cf2d2', 'Sabrina', 'Pisano', 'pisansabrina676@gmail.com', 'sabrinapisanoo_', 'APPROVED', '935951fd-c327-4a65-88ef-47e3df7cf2d2', 0, NULL, 1765375022936),
	('953f45f4-5154-48ba-beff-2774ac331227', 'Emanuele', 'Fusco', 'emanuele.fusco@gmail.com', 'man__fusco', 'APPROVED', '953f45f4-5154-48ba-beff-2774ac331227', 0, NULL, 1765384642406),
	('976f6172-f39f-4a8c-a079-7cf371fe98ae', 'ilaria', 'baffico', 'ily.baffico@gmail.com', 'ilariabaffico_', 'APPROVED', '976f6172-f39f-4a8c-a079-7cf371fe98ae', 0, NULL, 1765375653078),
	('9a00dccc-0fdc-4ce3-a3cd-31094d79c68b', 'Azzurra', 'Frattulillo', 'azzurrafrattulillo08@gmail.com', 'azzurra.frattulillo', 'APPROVED', '9a00dccc-0fdc-4ce3-a3cd-31094d79c68b', 0, NULL, 1765376607115),
	('9b4e50a5-3d00-4476-912c-772f777d0a95', 'mary', 'capone', 'marycapone28@gmail.com', 'maryy.cap_', 'APPROVED', '9b4e50a5-3d00-4476-912c-772f777d0a95', 0, NULL, 1765629079901),
	('9c52e64f-ffb8-4beb-ad3d-34c875919cee', 'Sophia', 'Mele', 'sophyprincipessa@gmail.com', 'Sophy ', 'APPROVED', '9c52e64f-ffb8-4beb-ad3d-34c875919cee', 0, NULL, 1765458198765),
	('9d10e9ca-942e-4991-91ff-7b5ce092b79e', 'Orsola', 'Florio', 'orsolaflorio07@gmail.com', 'floriooorsola', 'APPROVED', '9d10e9ca-942e-4991-91ff-7b5ce092b79e', 0, NULL, 1765377219243),
	('a1622cd6-8a7d-4773-b0b6-2e6682db26ab', 'Nicolo', 'Ortoli', 'paoletta309@tiscali.it', 'nicoloortoli', 'APPROVED', 'a1622cd6-8a7d-4773-b0b6-2e6682db26ab', 0, NULL, 1765397429486),
	('a2080986-5d34-4d8e-b001-d1825a881d09', 'maria', 'pezzullo ', 'mariapezzullo07@gmail.com', '_mariapezzullo_', 'APPROVED', 'a2080986-5d34-4d8e-b001-d1825a881d09', 0, NULL, 1765373000765),
	('a2c92778-c28e-4097-a0f7-d1447b4e04d6', 'Pietro', 'Ambrosio', 'pietroambrosio07@gmail.com', 'pietro.ambrosioo', 'APPROVED', 'a2c92778-c28e-4097-a0f7-d1447b4e04d6', 0, NULL, 1765381570686),
	('a43a6374-c164-4e0d-89a9-ebf327c79d73', 'Luca', 'Andolfi', 'lucandolfi04@icloud.com', 'andolfiluca_', 'APPROVED', 'a43a6374-c164-4e0d-89a9-ebf327c79d73', 0, NULL, 1765387515012),
	('a51a378c-f132-40f4-b1e6-524cddb4d1be', 'andrea ', 'biancardo', 'andreabiancardo08@gmail.com', 'andreabiancardo', 'APPROVED', 'a51a378c-f132-40f4-b1e6-524cddb4d1be', 0, NULL, 1765382629641),
	('a6e89484-92e5-4a85-9af6-04b7ad55d6e0', 'Arianna', 'Livigni', 'livigniarianna@icloud.com', 'arianna.livigni', 'APPROVED', 'a6e89484-92e5-4a85-9af6-04b7ad55d6e0', 0, NULL, 1765382176346),
	('a97e34be-44db-43ad-8bc1-3d328e43cbe5', 'ANDREA', 'AULETTA', 'andreauletta2007@gmail.com', '_andreauletta_', 'APPROVED', 'a97e34be-44db-43ad-8bc1-3d328e43cbe5', 0, NULL, 1765632938799),
	('af87fe90-1234-4582-9e38-935611197f5f', 'espedito', 'cirillo', 'espeditocirillo2017@gmail.com', 'tito_cirillo', 'APPROVED', 'af87fe90-1234-4582-9e38-935611197f5f', 0, NULL, 1765383730966),
	('b035035f-5b79-44a9-944b-84ef4c973669', 'Marisa', 'Cimmino', 'marisacimmino2006@libero.it', 'marisaacimmino ', 'APPROVED', 'b035035f-5b79-44a9-944b-84ef4c973669', 0, NULL, 1765481273479),
	('b090d59f-2b9a-42ba-9881-2d4de61b77d6', 'lidia ', 'gifuni', 'lidiagifuni2008@gmail.com', 'lidiagifuni', 'APPROVED', 'b090d59f-2b9a-42ba-9881-2d4de61b77d6', 0, NULL, 1765445006578),
	('b67c3d77-555e-4ef2-bf57-291ceb129620', 'Simone ', 'Puzio ', 'puziosimone@gmail.com', 'simone_puzio_', 'APPROVED', 'b67c3d77-555e-4ef2-bf57-291ceb129620', 0, NULL, 1765384170613),
	('bf59084f-0d78-4e0a-b39e-bbbe77c67139', 'Giulia ', 'Mondo', 'giuliamondo208@gmail.com', 'giuliamondoo', 'APPROVED', 'bf59084f-0d78-4e0a-b39e-bbbe77c67139', 0, NULL, 1765631270973),
	('c2077033-ecec-4a05-9890-2fb9f8372b9e', 'Anna', 'Di Sarno', 'disarnoanna9@gmail.com', 'annaa_disarno', 'APPROVED', 'c2077033-ecec-4a05-9890-2fb9f8372b9e', 0, NULL, 1765375629957),
	('c2286f94-20aa-45bf-8811-6f270709d8ec', 'Sabrina', 'Farina', 'sabrinafarina745@gmail.com', '_sabrinafarina', 'APPROVED', 'c2286f94-20aa-45bf-8811-6f270709d8ec', 0, NULL, 1765396613969),
	('c5e33866-30eb-48dd-bbd5-31b9a8002705', 'Chiara', 'Pelosi', 'chiarapelosi07@gmail.com', '_chiarapelosi_', 'APPROVED', 'c5e33866-30eb-48dd-bbd5-31b9a8002705', 0, NULL, 1765358761090),
	('c8b2d576-4a04-4146-98d5-2b46bac03aaf', 'Roberto', 'Fiorillo', 'robifiorillo00@gmail.com', 'robertofiorillo_', 'APPROVED', 'c8b2d576-4a04-4146-98d5-2b46bac03aaf', 0, NULL, 1765401209307),
	('cc60717d-c003-4735-aa60-ad23353ec135', 'Maria', 'Crispino', 'mariacrispino692@gmail.com', 'mariacrispino__', 'APPROVED', 'cc60717d-c003-4735-aa60-ad23353ec135', 0, NULL, 1765372801888),
	('cf33abff-2b81-472f-8db1-beb28c1dc28e', 'Ludovica', 'Puzio', 'ludovicapuzio@gmail.com', 'ludovica_puzio ', 'APPROVED', 'cf33abff-2b81-472f-8db1-beb28c1dc28e', 0, NULL, 1765372967585),
	('cf79870d-affd-4571-aa94-ac452feeb31b', 'Sophia', 'Mele', 'sophiameinfo@gmail.com', 'Sophy ', 'APPROVED', 'cf79870d-affd-4571-aa94-ac452feeb31b', 0, NULL, 1765387144487),
	('d27602ec-a3f0-41f5-a92a-a8ff2ff04690', 'Francesca', 'Galbera', 'francesca.galbera@gmail.com', 'francesca_galbera', 'APPROVED', 'd27602ec-a3f0-41f5-a92a-a8ff2ff04690', 0, NULL, 1765376033483),
	('d28c79ae-0b78-4904-aa1c-437325a25ef9', 'rita ', 'cimmino ', 'cimminorita72@gmail.com', 'rita_cimm', 'APPROVED', 'd28c79ae-0b78-4904-aa1c-437325a25ef9', 0, NULL, 1765395693916),
	('d3744ee8-c348-45b3-ad10-b6166dac3534', 'Simone', 'Del Prete', 'simonedelprete7002@gmail.com', '@simonedelprete0', 'APPROVED', 'd3744ee8-c348-45b3-ad10-b6166dac3534', 0, NULL, 1765386242553),
	('d5e7964d-e6b1-4f02-a422-926a49da5431', 'claudio ', 'grimaldi ', 'claudiogrimaldi2019@gmail', 'claudiogrimaldo_10', 'REJECTED', NULL, 0, NULL, 1765392404933),
	('d842a816-e4d4-428e-b085-fd5ae7ca6e95', 'simone', 'vergara', 'simonevergara8@gmail.com', 'simonevergara__', 'PENDING', NULL, 0, NULL, 1765532325154),
	('d8d76e52-161f-48cc-911c-19f3f6ec0744', 'Sophia', 'Mele', 'sophiameinfo@gmail.com', 'Sophy ', 'APPROVED', 'd8d76e52-161f-48cc-911c-19f3f6ec0744', 0, NULL, 1765390552068),
	('d9759d81-b206-48f6-9462-9216b6d6c13b', 'Vittorio ', 'Della bella ', 'vittoriodellabella11@gmail.com', 'vittorio_dellabella', 'APPROVED', 'd9759d81-b206-48f6-9462-9216b6d6c13b', 0, NULL, 1765476328708),
	('d9d55cf6-7b93-4366-af3e-7d5e622cf662', 'andrea', 'gallo', 'andreagallo2602@icloud.com', '_andrea_gallo_', 'PENDING', NULL, 0, NULL, 1765565051902),
	('dc260426-7213-4316-abdf-0ff304023325', 'Vincenzo', 'Mormile', 'mormileenzo4@gmail.com', '_vincenzomormile._', 'APPROVED', 'dc260426-7213-4316-abdf-0ff304023325', 0, NULL, 1765375345895),
	('dd29e970-d698-46ea-8489-7d77a89c9900', 'raffaele', 'di raffaele', 'lelesteam2012@hotmail.it', 'raffaele.di.raffaele', 'APPROVED', 'dd29e970-d698-46ea-8489-7d77a89c9900', 0, NULL, 1765558932986),
	('dfcb5e73-be98-4b56-8e4e-a4a1d18b93c1', 'Alessandro ', 'Capasso', 'alexcapasso1004@gmail.com', 'aalecapasso', 'APPROVED', 'dfcb5e73-be98-4b56-8e4e-a4a1d18b93c1', 0, NULL, 1765401690056),
	('e1b7802c-9e7e-4f05-af98-ed0d61a2faa9', 'Carlotta', 'Barbato', 'carlottabarbato16@gmail.com', 'lolaabarbato', 'APPROVED', 'e1b7802c-9e7e-4f05-af98-ed0d61a2faa9', 0, NULL, 1765372858633),
	('e1b8c7b0-4f55-4062-aa6c-7ec22f1db6f6', 'Margherita', 'Del Prete', 'margheritadelprete00@gmail.com', 'margheritadelprete__', 'APPROVED', 'e1b8c7b0-4f55-4062-aa6c-7ec22f1db6f6', 0, NULL, 1765392654981),
	('e5a522d2-c253-4c5c-bba9-721dd07debcf', 'Domenico ', 'Mormile ', 'domynikmormile@icloud.com', 'domenicomormile__', 'APPROVED', 'e5a522d2-c253-4c5c-bba9-721dd07debcf', 0, NULL, 1765359906080),
	('ea1e1484-d469-42c2-bbb0-8855872184e3', 'Alessia', 'Margarita', 'alessia.margarita2007@gmail.com', 'alessia.margarita', 'APPROVED', 'ea1e1484-d469-42c2-bbb0-8855872184e3', 0, NULL, 1765462433824),
	('eab3f215-1628-48ec-844e-439d53ebf152', 'Angela', 'Cappa', 'angelacappa6@gmail.com', 'angelacappa_', 'APPROVED', 'eab3f215-1628-48ec-844e-439d53ebf152', 0, NULL, 1765372002180),
	('ec449f7c-d770-4368-b4b6-7ed1e11a01ef', 'Daniele ', 'Cristiano', 'danielezeroquattro@gmail.com', 'holy_dan_', 'APPROVED', 'ec449f7c-d770-4368-b4b6-7ed1e11a01ef', 0, NULL, 1765628810479),
	('efb7a11c-7805-4767-989c-0b9015f1b825', 'Asia ', 'Vittorioso ', 'asiavittorioso@gmail.com', 'asia_vittorioso', 'APPROVED', 'efb7a11c-7805-4767-989c-0b9015f1b825', 0, NULL, 1765629183653),
	('f3bd97cf-576f-4acd-9f5b-c05d9c976dab', 'Nicola', 'Russo', 'russonicolagiuseppe@gmail.com', 'nicolaruss.o', 'REJECTED', NULL, 0, NULL, 1765385185293),
	('fd9079bc-d337-4ec8-a043-5013591cc7a8', 'Pasquale', 'Approvato', 'pasquale.approvato@gmail.com', 'pasqualeapprovato ', 'APPROVED', 'fd9079bc-d337-4ec8-a043-5013591cc7a8', 0, NULL, 1765377002647);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
