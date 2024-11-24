/*
 Navicat Premium Data Transfer

 Source Server         : my_database
 Source Server Type    : MySQL
 Source Server Version : 80026
 Source Host           : localhost:3306
 Source Schema         : address_book

 Target Server Type    : MySQL
 Target Server Version : 80026
 File Encoding         : 65001

 Date: 29/10/2024 16:16:27
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for contacts
-- ----------------------------
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts`  (
  `id` int(0) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '姓名',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号码',
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '地址',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `birthday` date NULL DEFAULT NULL COMMENT '生日',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '通讯录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of contacts
-- ----------------------------
INSERT INTO `contacts` VALUES (3, '苏佳莉', '15959019781', '福建省厦门市建安大道 112 号', '18888888@qq.com', '2004-06-27');
INSERT INTO `contacts` VALUES (4, '吴怡霏', '18059988192', '福建省泉州市花园小区 3 号楼', NULL, '2004-01-13');
INSERT INTO `contacts` VALUES (5, '许慧玲', '19905065773', '福建省厦门市科技园 6 号楼', NULL, '2002-12-03');
INSERT INTO `contacts` VALUES (6, '张锦淮', '18960314308', '福建省泉州市尚学领地 15 号楼', NULL, '2005-03-16');
INSERT INTO `contacts` VALUES (7, '哈兰小姐', '18674066588', '福建省福州市鼓楼区', NULL, '2005-09-11');
INSERT INTO `contacts` VALUES (8, '秦彻', '021-80480715', 'N109 区', NULL, '1996-04-18');
INSERT INTO `contacts` VALUES (9, '祁煜', '13683155454', '利莫里亚', NULL, '2000-03-06');
INSERT INTO `contacts` VALUES (10, '沈星回', '13188665077', '临空市花圃区猎人协会', NULL, '2001-10-16');
INSERT INTO `contacts` VALUES (11, '黎深', '13850704067', '临空市 Akso 医院心脏外科中心', NULL, '1997-09-05');

SET FOREIGN_KEY_CHECKS = 1;
