-- ====================================================================
-- CreatorHub Production Database Export for Hostinger / MySQL
-- Generated: 2026-09-11 13:17:06
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'creator',
  `is_verified` int DEFAULT '0',
  `is_active` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `users` (30 rows)
INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `is_verified`, `is_active`, `created_at`, `updated_at`) VALUES
('usr_1789019209918_a790d', 'deeksha123@gmail.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-10 11:16:50', '2026-09-11 10:27:24'),
('usr_1789029953631_60837', 'vidya123@gmail.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-10 14:15:53', '2026-09-10 14:15:53'),
('usr_1789031802025_b3a4f', 'arpitha123@gmail.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-10 14:46:42', '2026-09-10 14:46:42'),
('usr_1789032139242_ce7b1', 'chandanap234@gmail.com', '$2y$10$hbvxeq/syPt3DBR3FUgRxu0qWtTBvO4DjPSGqasyTkHdYj2dWXxtq', 'creator', '1', '1', '2026-09-10 14:52:19', '2026-09-10 17:23:39'),
('usr_1789033498701_e6aba', 'nyka123@gmail.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-10 15:14:58', '2026-09-10 15:14:58'),
('usr_1789034036677_937e8', 'lakme123@gmail.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-10 15:23:56', '2026-09-11 10:18:26'),
('usr_1789042777414_9057b', 'myntrafashion@gmail.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-10 17:49:37', '2026-09-10 17:49:37'),
('usr_1789104353972_5357e', 'arpithasureshkumar@gmail.com', '$2y$10$e4RuAoW1cC8FPYqUNII8fO4byKrjEcG/SNTThkX9AN2dAuOPcq1eO', 'creator', '1', '1', '2026-09-11 10:55:54', '2026-09-11 10:55:54'),
('usr_1789107903795_2402e', 'himalayacare@gmail.com', '$2y$10$pQEcuObqsdhkj/FTRvadhukARJ5GZci4Y/RzgK25d7kfynXp5UGa6', 'brand', '1', '1', '2026-09-11 11:55:03', '2026-09-11 11:55:03'),
('usr_admin_1', 'admin@creatorhub.com', '$2y$10$cwKA99jpSXtLessLzaTxlOsvNMdNtPvSBfBRff25NI0iVACD5tiRS', 'admin', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_brand_1', 'contact@thirdwave.in', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_brand_2', 'hello@bluetokai.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_brand_3', 'partner@cultfit.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_brand_bluetokai', 'roasters@bluetokaicoffee.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('usr_brand_boat', 'creators@boat-lifestyle.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_cultfit', 'partners@cult.fit', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_decathlon', 'sports@decathlon.in', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('usr_brand_demo', 'brand@creatorhub.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_brand_lakme', 'partnerships@lakmeindia.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-11 10:18:17'),
('usr_brand_lenskart', 'creators@lenskart.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_mamaearth', 'influencer@mamaearth.in', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('usr_brand_myntra', 'influencers@myntra.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_nykaa', 'beauty@nykaa.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_souledstore', 'collabs@thesouledstore.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_thirdwave', 'creator@thirdwavecoffee.in', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('usr_brand_zomato', 'creators@zomato.com', '$2y$10$o398rUfcwClA1UC1Qx3X/OWiEbsmwAayJmSs0fFcjYT0U.jLAepv2', 'brand', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('usr_chandana_4d0e63', 'chandanap.murthy@gmail.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-09 15:57:10', '2026-09-11 12:32:34'),
('usr_creator_1', 'ananya@lifestyle.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_creator_2', 'rohit@fitness.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('usr_creator_demo', 'creator@creatorhub.com', '$2y$10$cLqSkSGLyNFPBBgumN7UM.6YJ06Njiiwz811LHN6ITdFgJq8tiD66', 'creator', '1', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04');

-- --------------------------------------------------------
-- Table structure for `creator_profiles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `creator_profiles`;
CREATE TABLE `creator_profiles` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bengaluru',
  `area` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Karnataka',
  `lat` decimal(10,6) DEFAULT '12.971600',
  `lng` decimal(10,6) DEFAULT '77.594600',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `categories_json` text COLLATE utf8mb4_unicode_ci,
  `languages_json` text COLLATE utf8mb4_unicode_ci,
  `collab_preferences_json` text COLLATE utf8mb4_unicode_ci,
  `min_budget` decimal(10,2) DEFAULT '3000.00',
  `radius_km` decimal(6,2) DEFAULT '15.00',
  `rate_card_json` text COLLATE utf8mb4_unicode_ci,
  `availability` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `verified` int DEFAULT '0',
  `verification_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `verification_docs` text COLLATE utf8mb4_unicode_ci,
  `social_link` text COLLATE utf8mb4_unicode_ci,
  `subscription_tier` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `subscription_expires_at` timestamp NULL DEFAULT NULL,
  `subscription_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_creator_user_id` (`user_id`),
  KEY `idx_creator_username` (`username`),
  KEY `idx_creator_location` (`city`,`lat`,`lng`),
  KEY `idx_creator_tier` (`subscription_tier`),
  CONSTRAINT `creator_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `creator_profiles` (9 rows)
INSERT INTO `creator_profiles` (`id`, `user_id`, `full_name`, `username`, `phone`, `dob`, `city`, `area`, `state`, `lat`, `lng`, `bio`, `avatar_url`, `categories_json`, `languages_json`, `collab_preferences_json`, `min_budget`, `radius_km`, `rate_card_json`, `availability`, `verified`, `verification_status`, `verification_docs`, `social_link`, `subscription_tier`, `subscription_expires_at`, `subscription_updated_at`, `created_at`, `updated_at`) VALUES
('crt_1', 'usr_creator_1', 'Ananya Rao', 'ananya_bites', NULL, NULL, 'Bengaluru', 'Indiranagar', 'Karnataka', '12.971900', '77.641200', 'For Man collection check @zaraman \nKids collection @zarakids \nCustomer Care @zaracare\nDiscover Woman collection ⬇️', 'https://scontent.cdninstagram.com/v/t51.2885-19/358807565_255281447246610_5910927613606794914_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=1&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=w2ciU3q5-LsQ7kNvwGZzJob&_nc_oc=Adoc4PwuKwrylk1zqAjnamJDEiVAfSCFQlhv3n9maA_GBFbLWileZjtiuqE1jo785Dc&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b500&oh=00_AQIUZqgAlVMEq5X5lJp3KWaqJNkpoM4OUW3P9IxXB0FfBw&oe=6AA94214', '[\"Food & Dining\", \"Coffee\", \"Lifestyle\"]', NULL, NULL, '4000.00', '15.00', NULL, 'available', '1', 'verified', NULL, 'https://instagram.com/zara', 'gold', NULL, NULL, '2026-09-09 15:50:49', '2026-09-11 10:25:38'),
('crt_1789019210097_4f604', 'usr_1789019209918_a790d', 'deeksha123', 'deeksha123', NULL, NULL, 'Bengaluru', NULL, 'Karnataka', '12.971600', '77.594600', 'Makeup Artist 💄 | Fashion & Lifestyle ✨ | Bangalore 🌸 | DM for Collabs 📩', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JO0bT8JmDiauV4gyc1zQsw&_nc_ss=7b500&oh=00_AQJxmTzeSVYemOS06Cycp6coKHq0-HVXwdIFvFdS95NjFw&oe=6AA82ED8', NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '0', 'none', NULL, 'https://instagram.com/chandana__murthy', 'free', NULL, NULL, '2026-09-10 11:16:50', '2026-09-10 11:17:28'),
('crt_1789029953826_cee98', 'usr_1789029953631_60837', 'vidya123', 'vidya123', NULL, NULL, 'Bengaluru', NULL, 'Karnataka', '12.971600', '77.594600', 'New Creator on CreatorHub', NULL, NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '0', 'none', NULL, NULL, 'free', NULL, NULL, '2026-09-10 14:15:53', '2026-09-10 14:15:53'),
('crt_1789031802290_cdab9', 'usr_1789031802025_b3a4f', 'arpitha123', 'arpitha123', NULL, NULL, 'Bengaluru', 'Vijaynagar', 'Karnataka', '12.971900', '77.530500', 'New Creator on CreatorHub', NULL, NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '0', 'none', NULL, NULL, 'free', NULL, NULL, '2026-09-10 14:46:42', '2026-09-10 14:46:42'),
('crt_1789032139440_cb025', 'usr_1789032139242_ce7b1', 'chandanap234', 'chandanap234', NULL, NULL, 'Bengaluru', NULL, 'Karnataka', '12.971600', '77.594600', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=0IzICWUfyN5mESoUswEJlw&_nc_ss=7b500&oh=00_AQKbzg8WHaJXEaPn0VYZIFW5MMYTWDWR7Ig8F3UFjNYzeQ&oe=6AA98058', NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '0', 'none', NULL, 'https://instagram.com/chandana__murthy', 'free', NULL, NULL, '2026-09-10 14:52:19', '2026-09-11 13:03:27'),
('crt_1789104354104_b8192', 'usr_1789104353972_5357e', 'arpithasureshkumar', 'arpithasureshkumar', NULL, NULL, 'Bengaluru', 'Vijaynagar', 'Karnataka', '12.971900', '77.530500', 'Trusfated😵‍💫\nPètríçhòr🤍\nಮಸಾಲೆ ದೋಸೆ  & ಫಿಲ್ಟರ್ ಕಾಫಿ 🩷\nLive your way, it\'s yours anyway?', 'https://scontent.cdninstagram.com/v/t51.2885-19/280662102_1372076499955771_2471555189896201905_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=105&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=DEOxPea6IfEQ7kNvwHdHf9W&_nc_oc=AdqLasoEyd5pDLgrA-cC8ocBUtuDJQV6ANFnQkK75LnJoswQuNiQ9SHxMImIc5RcNBo&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b500&oh=00_AQKyaKJWWbHwgQAvvtMG1sadgVBu6-F6ublt3XKqAH2LSg&oe=6AA977EF', NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '0', 'none', NULL, 'https://instagram.com/arpitha____suresh', 'free', NULL, NULL, '2026-09-11 10:55:54', '2026-09-11 11:03:00'),
('crt_2', 'usr_creator_2', 'Rohit Verma', 'rohit_fit', NULL, NULL, 'Bengaluru', 'HSR Layout', 'Karnataka', '12.911600', '77.643200', 'Functional endurance athlete & health coach inspiring active lifestyles with performance nutrition.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', '[\"Fitness & Wellness\", \"Health\", \"Activewear\"]', NULL, NULL, '5000.00', '20.00', NULL, 'available', '1', 'verified', NULL, NULL, 'silver', NULL, NULL, '2026-09-09 15:50:49', '2026-09-09 15:50:49'),
('crt_chandana_c33894', 'usr_chandana_4d0e63', 'Chandana Murthy', 'chandana__murthy', '+91 9876543210', NULL, 'Bengaluru', 'Indiranagar', 'Karnataka', '12.971600', '77.594600', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=H7T8ddnhu3kFigs7MQvdKQ&_nc_ss=7b500&oh=00_AQIGlwZqdfn0UzGyV_vmOvAYZ9DPZCnopVKioJFQ6uqPPg&oe=6AA71598', NULL, NULL, NULL, '3000.00', '15.00', NULL, 'available', '1', 'approved', NULL, 'https://instagram.com/chandana__murthy', 'gold', NULL, NULL, '2026-09-09 15:57:10', '2026-09-09 15:59:32'),
('crt_demo', 'usr_creator_demo', 'CreatorHub Demo Influencer', 'creator_demo', NULL, NULL, 'Bengaluru', 'Indiranagar', 'Karnataka', '12.971600', '77.641200', 'Official Demo Creator profile for campaign testing, Instagram analytics & ₹1 VIP tier upgrades.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop', '[\"Food & Dining\", \"Lifestyle\", \"Fashion\"]', NULL, NULL, '3000.00', '25.00', NULL, 'available', '1', 'verified', NULL, NULL, 'gold', NULL, NULL, '2026-09-09 15:50:49', '2026-09-09 15:50:49');

-- --------------------------------------------------------
-- Table structure for `creator_subscriptions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `creator_subscriptions`;
CREATE TABLE `creator_subscriptions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'monthly',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `payment_method` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'UPI',
  `transaction_ref` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sub_creator` (`creator_id`),
  CONSTRAINT `creator_subscriptions_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `brand_profiles`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `brand_profiles`;
CREATE TABLE `brand_profiles` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bengaluru',
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Karnataka',
  `pin_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,6) DEFAULT '12.971600',
  `lng` decimal(10,6) DEFAULT '77.594600',
  `gst_number` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `rating` decimal(3,2) DEFAULT '5.00',
  `review_count` int DEFAULT '0',
  `verified` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_brand_user_id` (`user_id`),
  KEY `idx_brand_location` (`city`,`lat`,`lng`),
  CONSTRAINT `brand_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `brand_profiles` (20 rows)
INSERT INTO `brand_profiles` (`id`, `user_id`, `company_name`, `business_email`, `phone`, `category`, `website`, `location_name`, `address`, `city`, `state`, `pin_code`, `lat`, `lng`, `gst_number`, `logo_url`, `description`, `rating`, `review_count`, `verified`, `created_at`, `updated_at`) VALUES
('brd_1', 'usr_brand_1', 'Third Wave Coffee', 'contact@thirdwave.in', NULL, 'Food & Beverage', NULL, 'Indiranagar 12th Main', '724, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.978400', '77.640800', NULL, 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256', 'Specialty coffee roastery dedicated to sustainable direct sourcing and artisanal brewing.', '4.90', '28', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('brd_1789033498790_19aae', 'usr_1789033498701_e6aba', 'Nykaa', 'nyka123@gmail.com', '', 'Beauty & Skincare', '', '', '', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256', 'India\'s premier beauty & wellness destination', '5.00', '0', '1', '2026-09-10 15:14:58', '2026-09-10 15:14:58'),
('brd_1789034036806_692fd', 'usr_1789034036677_937e8', 'Lakmé', 'lakme123@gmail.com', '', 'Beauty & Skincare', '', '', '', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256', 'Iconic Indian cosmetics & beauty care brand', '5.00', '0', '1', '2026-09-10 15:23:56', '2026-09-10 15:23:56'),
('brd_1789042777615_6dfda', 'usr_1789042777414_9057b', 'Myntra', 'myntrafashion@gmail.com', '', 'Fashion & Apparel', '', '', '', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=myntra.com&sz=256', 'Leading online fashion and lifestyle store with latest trends', '5.00', '0', '1', '2026-09-10 17:49:37', '2026-09-10 17:49:37'),
('brd_1789107903962_e3f8b', 'usr_1789107903795_2402e', 'Starbucks', 'himalayacare@gmail.com', '', 'Lifestyle', '', '', '', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'data:image/webp;base64,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', '', '5.00', '0', '1', '2026-09-11 11:55:03', '2026-09-11 12:27:49'),
('brd_2', 'usr_brand_2', 'Blue Tokai Coffee Roasters', 'hello@bluetokai.com', NULL, 'Food & Beverage', NULL, 'Koramangala 4th Block', '583, 80 Feet Rd, 4th Block, Koramangala, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.935200', '77.624500', NULL, 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256', 'Direct-trade Indian specialty coffee pioneer bringing single-estate roasts straight to coffee enthusiasts.', '4.80', '19', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('brd_3', 'usr_brand_3', 'Cult.fit Studio', 'partner@cultfit.com', NULL, 'Fitness & Wellness', NULL, 'HSR Layout Sector 3', '17th Cross Rd, Sector 3, HSR Layout, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.912100', '77.644600', NULL, 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256', 'Holistic health & fitness platform offering strength conditioning, HIIT, and functional training.', '5.00', '42', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('brd_bluetokai', 'usr_brand_bluetokai', 'Blue Tokai Coffee Roasters', 'roasters@bluetokaicoffee.com', NULL, 'Food & Beverage', NULL, 'Koramangala 4th Block', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('brd_boat', 'usr_brand_boat', 'boAt', 'creators@boat-lifestyle.com', NULL, 'Technology', NULL, 'Koramangala 80ft Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=boat-lifestyle.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_cultfit', 'usr_brand_cultfit', 'Cult.fit', 'partners@cult.fit', NULL, 'Fitness & Wellness', NULL, 'HSR Layout Sector 3', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_decathlon', 'usr_brand_decathlon', 'Decathlon', 'sports@decathlon.in', NULL, 'Fitness & Wellness', NULL, 'Whitefield Main Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=decathlon.in&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('brd_demo', 'usr_brand_demo', 'CreatorHub Brand Studio', 'brand@creatorhub.com', NULL, 'Food & Beverage', NULL, 'MG Road Central', '101, MG Road, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.975000', '77.605000', NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=CreatorHub+Brand+Studio&backgroundColor=ea580c&textColor=ffffff&fontSize=42&fontWeight=800', 'Official Demo Brand account for CreatorHub campaigns and escrow testing.', '5.00', '10', '1', '2026-09-09 15:49:04', '2026-09-09 15:49:04'),
('brd_lakme', 'usr_brand_lakme', 'Lakmé', 'partnerships@lakmeindia.com', NULL, 'Beauty & Skincare', NULL, 'Indiranagar 100ft Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256', 'Iconic Indian cosmetics & beauty care brand', '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_lenskart', 'usr_brand_lenskart', 'Lenskart', 'creators@lenskart.com', NULL, 'Fashion', NULL, 'Church Street', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=lenskart.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_mamaearth', 'usr_brand_mamaearth', 'Mamaearth', 'influencer@mamaearth.in', NULL, 'Beauty & Skincare', NULL, 'Jayanagar 4th Block', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('brd_myntra', 'usr_brand_myntra', 'Myntra', 'influencers@myntra.com', NULL, 'Fashion & Apparel', NULL, 'MG Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=myntra.com&sz=256', 'Leading online fashion and lifestyle store with latest trends', '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_nykaa', 'usr_brand_nykaa', 'Nykaa', 'beauty@nykaa.com', NULL, 'Beauty & Skincare', NULL, 'Lavelle Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256', 'India\'s premier beauty & wellness destination', '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_souledstore', 'usr_brand_souledstore', 'The Souled Store', 'collabs@thesouledstore.com', NULL, 'Fashion', NULL, 'Koramangala 5th Block', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=thesouledstore.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('brd_thirdwave', 'usr_brand_thirdwave', 'Third Wave Coffee', 'creator@thirdwavecoffee.in', NULL, 'Food & Beverage', NULL, 'Indiranagar 12th Main', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:03', '2026-09-10 16:41:03'),
('brd_zomato', 'usr_brand_zomato', 'Zomato', 'creators@zomato.com', NULL, 'Food & Beverage', NULL, 'Indiranagar 100ft Road', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', NULL, 'https://www.google.com/s2/favicons?domain=zomato.com&sz=256', NULL, '5.00', '0', '1', '2026-09-10 16:41:04', '2026-09-10 16:41:04');

-- --------------------------------------------------------
-- Table structure for `campaigns`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE `campaigns` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `objective` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Bengaluru',
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Karnataka',
  `pin_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,6) DEFAULT '12.971600',
  `lng` decimal(10,6) DEFAULT '77.594600',
  `radius_km` decimal(6,2) DEFAULT '10.00',
  `min_followers` int DEFAULT '1000',
  `max_followers` int DEFAULT '500000',
  `req_categories_json` text COLLATE utf8mb4_unicode_ci,
  `req_engagement` decimal(5,2) DEFAULT '2.00',
  `deliverables_json` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget_total` decimal(12,2) NOT NULL,
  `reward_per_creator` decimal(12,2) NOT NULL,
  `creators_required` int NOT NULL,
  `creators_hired` int DEFAULT '0',
  `platform` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Instagram',
  `start_date` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_date` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_deadline` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_deadline` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'PUBLISHED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaigns_brand` (`brand_id`),
  KEY `idx_campaigns_location` (`city`,`lat`,`lng`),
  KEY `idx_campaigns_status` (`status`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `campaigns` (20 rows)
INSERT INTO `campaigns` (`id`, `brand_id`, `title`, `description`, `objective`, `category`, `image_url`, `location_name`, `address`, `city`, `state`, `pin_code`, `lat`, `lng`, `radius_km`, `min_followers`, `max_followers`, `req_categories_json`, `req_engagement`, `deliverables_json`, `budget_total`, `reward_per_creator`, `creators_required`, `creators_hired`, `platform`, `start_date`, `end_date`, `app_deadline`, `content_deadline`, `status`, `created_at`, `updated_at`) VALUES
('cmp_1789043960992_a3627', 'brd_1789042777615_6dfda', 'Myntra seasonal collection promo Men', 'fashion branded collection', NULL, 'Fashion & Apparel', 'data:image/webp;base64,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', 'jp nagar', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', '15.00', '1000', '500000', NULL, '2.00', '[\"1x Instagram Reel\"]', '15000.00', '5000.00', '3', '0', 'Instagram', NULL, NULL, NULL, NULL, 'PAUSED', '2026-09-10 18:09:21', '2026-09-11 10:26:19'),
('cmp_1789108963745_74e82', 'brd_1789107903962_e3f8b', 'himalaya', 'sdfghjkm,l.', NULL, 'Beauty & Skincare', 'data:image/webp;base64,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', 'Nagrabhavi', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', '10.00', '1000', '500000', NULL, '2.00', '[\"1x Instagram Reel\"]', '15000.00', '5000.00', '3', '0', 'Instagram', NULL, NULL, NULL, NULL, 'PUBLISHED', '2026-09-11 12:12:43', '2026-09-11 12:12:43'),
('cmp_1789109882415_20c78', 'brd_1789107903962_e3f8b', 'Starbucks', 'Global coffe house', NULL, 'Lifestyle', 'data:image/webp;base64,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', 'vijaynagr', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', '10.00', '1000', '500000', NULL, '2.00', '[\"1x Instagram Reel\"]', '15000.00', '5000.00', '3', '0', 'Instagram', NULL, NULL, NULL, NULL, 'PUBLISHED', '2026-09-11 12:28:02', '2026-09-11 12:28:02'),
('cmp_bluetokai', 'brd_bluetokai', 'Specialty Pour-Over Experience & Vlogs', 'Capture the barista craft and rich taste profile of single-origin roast coffee during a specialty pour-over workshop in Koramangala.', NULL, 'Food & Beverage', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&auto=format&fit=crop&q=80', 'Koramangala 80ft Road', '583, 80 Feet Rd, 4th Block, Koramangala, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.935200', '77.624500', '15.00', '1500', '150000', '[\"Food & Beverage\", \"Lifestyle\"]', '2.80', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x High-quality barista brew Reel\"},{\"type\":\"Carousel\",\"count\":1,\"requirement\":\"1x 5-slide flavor tasting notes\"}]', '15000.00', '5000.00', '3', '0', 'Instagram', '2026-09-05', '2026-09-28', '2026-09-20', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_boat', 'brd_boat', 'Wireless Audio Creator Campaign', 'Showcase the everyday use of boAt wireless audio products through an engaging short-form video highlighting bass quality, battery life, and style.', NULL, 'Lifestyle', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&auto=format&fit=crop&q=80', 'Koramangala 80ft Road', '80 Feet Rd, 4th Block, Koramangala, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.935200', '77.624500', '20.00', '3000', '300000', '[\"Technology\", \"Lifestyle\", \"Music\"]', '3.20', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x Beat-synced product lifestyle Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Swipe-up product link Stories\"}]', '60000.00', '12000.00', '5', '1', 'Instagram', '2026-09-05', '2026-10-10', '2026-09-25', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_cultfit', 'brd_cultfit', 'HIIT Workout Challenge & Fitness Vlog', 'Document a high-intensity session at Cult.fit and share your fitness journey, trainer guidance, and workout energy with your community.', NULL, 'Fitness & Wellness', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&auto=format&fit=crop&q=80', 'HSR Layout Sector 3', '17th Cross Rd, Sector 3, HSR Layout, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.912100', '77.644600', '15.00', '2000', '200000', '[\"Fitness & Wellness\", \"Activewear\"]', '3.00', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x High-energy workout recap Reel\"},{\"type\":\"Story\",\"count\":3,\"requirement\":\"3x Live Stories during gym workout\"}]', '34000.00', '8500.00', '4', '1', 'Instagram', '2026-09-02', '2026-09-30', '2026-09-22', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_decathlon', 'brd_decathlon', 'Active Outdoor Gear & Sports Challenge', 'Test out our trail hiking gear, breathable activewear, and fitness accessories in an energetic outdoor sports challenge video.', NULL, 'Fitness & Wellness', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=500&auto=format&fit=crop&q=80', 'Whitefield Main Road', 'Whitefield Main Rd, Devasandra Industrial Estate, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.969800', '77.749900', '25.00', '3000', '300000', '[\"Fitness & Wellness\", \"Sports\", \"Outdoors\"]', '3.20', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x Outdoor workout / gear test Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Gear recommendation Stories\"}]', '40000.00', '10000.00', '4', '1', 'Instagram', '2026-09-04', '2026-10-12', '2026-09-26', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_lakme', 'brd_lakme', 'Iconic Kajal — Beauty Creator Campaign', 'Create an engaging Instagram Reel showcasing the Iconic Kajal and demonstrate its smudge-proof everyday look and intense finish.', NULL, 'Beauty & Skincare', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&auto=format&fit=crop&q=80', 'Indiranagar 100ft Road', '100 Feet Rd, Indiranagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.641200', '15.00', '1500', '150000', '[\"Beauty & Skincare\", \"Lifestyle\"]', '2.80', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x 30s High-contrast Eye Makeup Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Product close-up Stories\"}]', '15000.00', '5000.00', '3', '0', 'Instagram', '2026-09-08', '2026-10-05', '2026-09-22', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_lenskart', 'brd_lenskart', 'Studio Eyewear Try-On & Style Guide', 'Showcase 3 curated Lenskart frames paired with casual and workwear outfits to demonstrate how modern eyewear elevates personal style.', NULL, 'Fashion', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=500&auto=format&fit=crop&q=80', 'Church Street', 'Church St, Haridevpur, Shanthala Nagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.974900', '77.604500', '15.00', '2000', '250000', '[\"Fashion\", \"Accessories\"]', '2.90', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x 3-frame quick transition Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Frame styling polls on Stories\"}]', '22500.00', '7500.00', '3', '0', 'Instagram', '2026-09-07', '2026-10-05', '2026-09-23', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_mamaearth', 'brd_mamaearth', 'Toxin-Free Daily Care & Organic Routine', 'Showcase our naturally certified daily hair and skin essentials in an authentic get-ready-with-me transition video highlighting clean natural ingredients.', NULL, 'Beauty & Skincare', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=500&auto=format&fit=crop&q=80', 'Jayanagar 4th Block', '11th Main Rd, 4th Block, Jayanagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.929800', '77.583300', '15.00', '1500', '150000', '[\"Beauty & Skincare\", \"Organic Lifestyle\"]', '2.70', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x GRWM organic routine Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Product texture review Stories\"}]', '18000.00', '6000.00', '3', '0', 'Instagram', '2026-09-07', '2026-10-04', '2026-09-22', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_myntra', 'brd_myntra', 'Festive Fashion Styling Reel', 'Create a short-form styling video featuring festive looks from the latest collection with creative outfit transitions and lookbook breakdowns.', NULL, 'Fashion', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&auto=format&fit=crop&q=80', 'MG Road', 'MG Road Boulevard, Ashok Nagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.975600', '77.606600', '25.00', '4000', '400000', '[\"Fashion\", \"Apparel\", \"Lifestyle\"]', '3.50', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x 3-outfit festive transition Reel\"},{\"type\":\"Post\",\"count\":1,\"requirement\":\"1x High-resolution carousel lookbook\"}]', '90000.00', '15000.00', '6', '2', 'Instagram', '2026-09-02', '2026-10-15', '2026-09-24', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_nykaa', 'brd_nykaa', 'Summer Glow Skincare & Beauty Routine', 'Feature your morning skincare essentials using Nykaa Cosmetics in a high-energy transition reel showcasing glowing skin texture and hydration.', NULL, 'Beauty & Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&auto=format&fit=crop&q=80', 'Lavelle Road', 'Lavelle Rd, Shanthala Nagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.971900', '77.599800', '15.00', '2000', '200000', '[\"Beauty & Skincare\", \"Wellness\"]', '3.00', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x Step-by-step skincare routine Reel\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Product ingredient breakdown Stories\"}]', '32000.00', '8000.00', '4', '0', 'Instagram', '2026-09-06', '2026-10-02', '2026-09-22', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_pitch_1789044588287_d819', 'brd_1789033498790_19aae', 'Test Collaboration Offer', 'Hi, we would love to collaborate on our upcoming campaign!', NULL, 'Beauty & Skincare', NULL, 'Bengaluru', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', '10.00', '1000', '500000', NULL, '2.00', '[\"1 Reel + 2 Stories\"]', '6000.00', '6000.00', '1', '0', 'Instagram', NULL, NULL, NULL, NULL, 'PAUSED', '2026-09-10 18:19:48', '2026-09-11 10:26:16'),
('cmp_pitch_1789044648113_1dc3', 'brd_1789033498790_19aae', 'Direct Message Pitch Offer', 'Hello via direct-pitch endpoint!', NULL, 'Beauty & Skincare', NULL, 'Bengaluru', NULL, 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.594600', '10.00', '1000', '500000', NULL, '2.00', '[\"1 Reel + 1 Story\"]', '7500.00', '7500.00', '1', '0', 'Instagram', NULL, NULL, NULL, NULL, 'PAUSED', '2026-09-10 18:20:48', '2026-09-11 10:26:18'),
('cmp_souledstore', 'brd_souledstore', 'Pop-Culture Merch & Streetwear Lookbook', 'Create an upbeat reel featuring oversized tees, anime drops, and streetwear fits tailored for daily casual aesthetic.', NULL, 'Fashion', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=500&auto=format&fit=crop&q=80', 'Koramangala 5th Block', '1st Cross Rd, 5th Block, Koramangala, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.934400', '77.619200', '15.00', '2500', '250000', '[\"Fashion\", \"Streetwear\"]', '3.10', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x Streetwear lookbook Reel with music\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Outfit unboxing Stories\"}]', '32500.00', '6500.00', '5', '0', 'Instagram', '2026-09-05', '2026-10-08', '2026-09-24', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_thirdwave', 'brd_thirdwave', 'Artisanal Cold Brew Tasting & Craft Reel', 'Create an aesthetic 30-second Reel featuring our seasonal cold brew range, barista craft, and the inviting ambiance of our roastery.', NULL, 'Food & Beverage', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&h=500&auto=format&fit=crop&q=80', 'Indiranagar 12th Main', '724, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.978400', '77.640800', '15.00', '1000', '100000', '[\"Food & Beverage\", \"Lifestyle\"]', '2.50', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x 30-45s Reel showcasing cold brew bar\"},{\"type\":\"Story\",\"count\":2,\"requirement\":\"2x Stories with outlet location tag\"}]', '24000.00', '6000.00', '4', '1', 'Instagram', '2026-09-01', '2026-09-28', '2026-09-20', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04'),
('cmp_vijaynagar_cafe', 'brd_thirdwave', 'Vijaynagar Artisanal Cold Brew & Cafe Vlogs', 'Visit our newly launched specialty coffee roastery in Vijaynagar! Create an aesthetic short reel reviewing our cold brews and brunch menu.', NULL, 'Food & Beverage', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&auto=format&fit=crop&q=80', 'Vijaynagar 2nd Main Road', '14, 2nd Main Rd, RPC Layout, Vijayanagar, Bengaluru, Karnataka 560040', 'Bengaluru', 'Karnataka', NULL, '12.971900', '77.530500', '20.00', '200', '100000', '[\"Food & Dining\",\"Lifestyle\",\"Coffee\"]', '2.00', '[\"1x Instagram Reel \\/ Video with cafe tour\",\"2x Story Mentions with location tag\"]', '25000.00', '4500.00', '4', '0', 'Instagram', NULL, NULL, '2026-10-11', NULL, 'PUBLISHED', '2026-09-11 11:19:15', '2026-09-11 11:19:15'),
('cmp_vijaynagar_cultfit', 'brd_cultfit', 'Vijaynagar Cult.fit Morning HIIT & Fitness Routine', 'Document an intense morning group workout session at Cult.fit Vijaynagar centre with recovery smoothie recommendations.', NULL, 'Fitness & Wellness', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=500&auto=format&fit=crop&q=80', 'Vijaynagar Service Road', '32, Vijayanagar Service Rd, Chord Road, Bengaluru, Karnataka 560040', 'Bengaluru', 'Karnataka', NULL, '12.969500', '77.534000', '20.00', '250', '200000', '[\"Fitness & Wellness\",\"Health\",\"Activewear\"]', '2.00', '[\"1x 4K Workout Reel \\/ vlog\",\"1x Story with link to free pass\"]', '35000.00', '7500.00', '3', '0', 'Instagram', NULL, NULL, '2026-10-16', NULL, 'PUBLISHED', '2026-09-11 11:19:15', '2026-09-11 11:19:15'),
('cmp_vijaynagar_streetwear', 'brd_souledstore', 'Vijaynagar Streetwear & Pop-Culture Lookbook', 'Showcase the newest oversized anime tees and cargo collections with dynamic transitions around vibrant urban spots in Vijaynagar.', NULL, 'Fashion', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&auto=format&fit=crop&q=80', 'Vijaynagar Club Road', 'Shop 8, Club Road, Vijayanagar, Bengaluru, Karnataka 560040', 'Bengaluru', 'Karnataka', NULL, '12.972500', '77.532000', '25.00', '300', '150000', '[\"Fashion\",\"Streetwear\",\"Lifestyle\"]', '2.00', '[\"1x High-Energy Styling Reel\",\"1x Carousel Lookbook post\"]', '30000.00', '6000.00', '3', '0', 'Instagram', NULL, NULL, '2026-10-06', NULL, 'PUBLISHED', '2026-09-11 11:19:15', '2026-09-11 11:19:15'),
('cmp_zomato', 'brd_zomato', 'Local Culinary Hidden Gems & Food Crawl', 'Explore top trending indie cafes and authentic street delicacies in Bengaluru, creating an appetizing food crawl reel with real tasting reactions.', NULL, 'Food & Beverage', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&auto=format&fit=crop&q=80', 'Indiranagar 100ft Road', '100 Feet Rd, Indiranagar, Bengaluru', 'Bengaluru', 'Karnataka', NULL, '12.971600', '77.641200', '15.00', '2000', '200000', '[\"Food & Beverage\", \"Dining & Nightlife\"]', '2.90', '[{\"type\":\"Reel\",\"count\":1,\"requirement\":\"1x Food crawl mini-vlog Reel\"},{\"type\":\"Story\",\"count\":3,\"requirement\":\"3x Dish rating Stories\"}]', '35000.00', '7000.00', '5', '0', 'Instagram', '2026-09-08', '2026-10-06', '2026-09-25', NULL, 'PUBLISHED', '2026-09-10 16:41:04', '2026-09-10 16:41:04');

-- --------------------------------------------------------
-- Table structure for `campaign_applications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `campaign_applications`;
CREATE TABLE `campaign_applications` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pitch` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `relevant_experience` text COLLATE utf8mb4_unicode_ci,
  `content_idea` text COLLATE utf8mb4_unicode_ci,
  `sample_links` text COLLATE utf8mb4_unicode_ci,
  `proposed_budget` decimal(10,2) DEFAULT NULL,
  `proposed_deliverables` text COLLATE utf8mb4_unicode_ci,
  `availability` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'immediate',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_apps_campaign` (`campaign_id`),
  KEY `idx_apps_creator` (`creator_id`),
  KEY `idx_apps_brand` (`brand_id`),
  CONSTRAINT `campaign_applications_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_applications_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_applications_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `campaign_applications` (4 rows)
INSERT INTO `campaign_applications` (`id`, `campaign_id`, `creator_id`, `brand_id`, `pitch`, `relevant_experience`, `content_idea`, `sample_links`, `proposed_budget`, `proposed_deliverables`, `availability`, `status`, `applied_at`, `updated_at`) VALUES
('app_pitch_1789044588337_12e4', 'cmp_pitch_1789044588287_d819', 'crt_1', 'brd_1789033498790_19aae', 'Direct Brand Pitch: Hi, we would love to collaborate on our upcoming campaign!', NULL, NULL, NULL, '6000.00', '1 Reel + 2 Stories', 'immediate', 'ACCEPTED', '2026-09-10 18:19:48', '2026-09-10 18:19:48'),
('app_pitch_1789044648131_4dc2', 'cmp_pitch_1789044648113_1dc3', 'crt_1', 'brd_1789033498790_19aae', 'Direct Brand Pitch: Hello via direct-pitch endpoint!', NULL, NULL, NULL, '7500.00', '1 Reel + 1 Story', 'immediate', 'ACCEPTED', '2026-09-10 18:20:48', '2026-09-10 18:20:48'),
('app_pitch_1789044745210_2251', 'cmp_pitch_1789044648113_1dc3', 'crt_1789032139440_cb025', 'brd_1789042777615_6dfda', 'Direct Brand Pitch: hii', NULL, NULL, NULL, '7500.00', '[\"1 Reel + 1 Story\"]', 'immediate', 'ACCEPTED', '2026-09-10 18:22:25', '2026-09-10 18:22:25'),
('app_pitch_1789112261409_0303', 'cmp_1789109882415_20c78', 'crt_1789104354104_b8192', 'brd_1789107903962_e3f8b', 'Direct Brand Pitch: hiiii', NULL, NULL, NULL, '5000.00', '[\"1x Instagram Reel\"]', 'immediate', 'ACCEPTED', '2026-09-11 13:07:41', '2026-09-11 13:07:41');

-- --------------------------------------------------------
-- Table structure for `collaborations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `collaborations`;
CREATE TABLE `collaborations` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `application_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'ACCEPTED',
  `current_step` int DEFAULT '1',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_collab_creator` (`creator_id`),
  KEY `idx_collab_brand` (`brand_id`),
  CONSTRAINT `collaborations_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaborations_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `campaign_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaborations_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaborations_ibfk_4` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `collaborations` (4 rows)
INSERT INTO `collaborations` (`id`, `campaign_id`, `application_id`, `brand_id`, `creator_id`, `status`, `current_step`, `started_at`, `completed_at`) VALUES
('collab_1789044588348_45b1', 'cmp_pitch_1789044588287_d819', 'app_pitch_1789044588337_12e4', 'brd_1789033498790_19aae', 'crt_1', 'ACTIVE', '1', '2026-09-10 18:19:48', NULL),
('collab_1789044648142_7ea5', 'cmp_pitch_1789044648113_1dc3', 'app_pitch_1789044648131_4dc2', 'brd_1789033498790_19aae', 'crt_1', 'ACTIVE', '1', '2026-09-10 18:20:48', NULL),
('collab_1789044745226_6b59', 'cmp_pitch_1789044648113_1dc3', 'app_pitch_1789044745210_2251', 'brd_1789042777615_6dfda', 'crt_1789032139440_cb025', 'ACTIVE', '1', '2026-09-10 18:22:25', NULL),
('collab_1789112261429_b316', 'cmp_1789109882415_20c78', 'app_pitch_1789112261409_0303', 'brd_1789107903962_e3f8b', 'crt_1789104354104_b8192', 'ACTIVE', '1', '2026-09-11 13:07:41', NULL);

-- --------------------------------------------------------
-- Table structure for `deliverables`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `deliverables`;
CREATE TABLE `deliverables` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collaboration_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `live_post_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Instagram',
  `caption` text COLLATE utf8mb4_unicode_ci,
  `screenshot_url` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `brand_feedback` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'SUBMITTED',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `collaboration_id` (`collaboration_id`),
  CONSTRAINT `deliverables_ibfk_1` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collaboration_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `payment_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Escrow Lock',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `is_simulated` int DEFAULT '0',
  `transaction_ref` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razorpay_order_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_payment_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_signature_verified` int DEFAULT '0',
  `webhook_event_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `brand_id` (`brand_id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_payments_collab` (`collaboration_id`),
  KEY `idx_payments_rzp_order` (`razorpay_order_id`),
  KEY `idx_payments_rzp_payment` (`razorpay_payment_id`),
  KEY `idx_payments_webhook_event` (`webhook_event_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `payments` (7 rows)
INSERT INTO `payments` (`id`, `collaboration_id`, `brand_id`, `creator_id`, `amount`, `currency`, `payment_type`, `status`, `is_simulated`, `transaction_ref`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `razorpay_signature_verified`, `webhook_event_id`, `failure_reason`, `paid_at`, `verified_at`, `released_at`, `created_at`, `updated_at`) VALUES
('pay_1789044588355_ca06', 'collab_1789044588348_45b1', 'brd_1789033498790_19aae', 'crt_1', '6000.00', 'INR', 'Escrow Lock', 'PENDING', '0', 'TXN_ESCROW_1789044588', NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-10 18:19:48', '2026-09-10 18:19:48'),
('pay_1789044648153_2280', 'collab_1789044648142_7ea5', 'brd_1789033498790_19aae', 'crt_1', '7500.00', 'INR', 'Escrow Lock', 'PENDING', '0', 'TXN_ESCROW_1789044648', NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-10 18:20:48', '2026-09-10 18:20:48'),
('pay_1789044745232_c2f8', 'collab_1789044745226_6b59', 'brd_1789042777615_6dfda', 'crt_1789032139440_cb025', '7500.00', 'INR', 'Escrow Lock', 'PENDING', '0', 'TXN_ESCROW_1789044745', NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-10 18:22:25', '2026-09-10 18:22:25'),
('pay_1789112261436_7a3e', 'collab_1789112261429_b316', 'brd_1789107903962_e3f8b', 'crt_1789104354104_b8192', '5000.00', 'INR', 'Escrow Lock', 'PENDING', '0', 'TXN_ESCROW_1789112261', NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-11 13:07:41', '2026-09-11 13:07:41'),
('pay_sub_1789032384492_0b96a', NULL, NULL, 'crt_1789032139440_cb025', '1.00', 'INR', 'Subscription Upgrade', 'PENDING', '1', 'order_sub_sim_1789032384492_148ad', 'order_sub_sim_1789032384492_148ad', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-10 14:56:24', '2026-09-10 14:56:24'),
('pay_sub_1789039748844_ba260', NULL, NULL, 'crt_1789032139440_cb025', '1.00', 'INR', 'Subscription Upgrade', 'PENDING', '1', 'order_sub_sim_1789039748844_afc8e', 'order_sub_sim_1789039748844_afc8e', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-10 16:59:08', '2026-09-10 16:59:08'),
('pay_sub_1789112455568_71591', NULL, NULL, 'crt_1789032139440_cb025', '1.00', 'INR', 'Subscription Upgrade', 'PENDING', '1', 'order_sub_sim_1789112455568_9365e', 'order_sub_sim_1789112455568_9365e', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, '2026-09-11 13:10:55', '2026-09-11 13:10:55');

-- --------------------------------------------------------
-- Table structure for `conversations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_message` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `idx_conv_participants` (`brand_id`,`creator_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brand_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `conversations` (4 rows)
INSERT INTO `conversations` (`id`, `brand_id`, `creator_id`, `campaign_id`, `last_message`, `updated_at`) VALUES
('conv_1', 'brd_1', 'crt_1', NULL, 'Welcome to the campaign Ananya! We are excited to see your craft reel draft.', '2026-09-09 15:49:30'),
('conv_1789044588372', 'brd_1789033498790_19aae', 'crt_1', 'cmp_pitch_1789044648113_1dc3', 'Direct Pitch: Hello via direct-pitch endpoint!', '2026-09-10 18:20:48'),
('conv_1789044745243', 'brd_1789042777615_6dfda', 'crt_1789032139440_cb025', 'cmp_pitch_1789044648113_1dc3', 'Direct Pitch: hii', '2026-09-10 18:22:25'),
('conv_1789112261460', 'brd_1789107903962_e3f8b', 'crt_1789104354104_b8192', 'cmp_1789109882415_20c78', 'Direct Pitch: hiiii', '2026-09-11 13:07:41');

-- --------------------------------------------------------
-- Table structure for `messages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_url` text COLLATE utf8mb4_unicode_ci,
  `read_status` int DEFAULT '0',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_msg_conv` (`conversation_id`,`sent_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `messages` (5 rows)
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `text`, `attachment_url`, `read_status`, `sent_at`) VALUES
('msg_1', 'conv_1', 'usr_brand_1', 'Welcome to the campaign Ananya! We are excited to see your craft reel draft.', NULL, '1', '2026-09-09 15:49:30'),
('msg_1789044588381_d060', 'conv_1789044588372', 'usr_1789033498701_e6aba', '🎯 DIRECT COLLABORATION PITCH\nBrand: Nykaa\nProject: Test Collaboration Offer\nOffer: ₹6,000\nDeliverables: 1 Reel + 2 Stories\n\nNote: Hi, we would love to collaborate on our upcoming campaign!', NULL, '0', '2026-09-10 18:19:48'),
('msg_1789044648186_f38d', 'conv_1789044588372', 'usr_1789033498701_e6aba', '🎯 DIRECT COLLABORATION PITCH\nBrand: Nykaa\nProject: Direct Message Pitch Offer\nOffer: ₹7,500\nDeliverables: 1 Reel + 1 Story\n\nNote: Hello via direct-pitch endpoint!', NULL, '0', '2026-09-10 18:20:48'),
('msg_1789044745248_696c', 'conv_1789044745243', 'usr_1789042777414_9057b', '🎯 DIRECT COLLABORATION PITCH\nBrand: Myntra\nProject: Direct Message Pitch Offer\nOffer: ₹7,500\nDeliverables: [\"1 Reel + 1 Story\"]\n\nNote: hii', NULL, '0', '2026-09-10 18:22:25'),
('msg_1789112261475_b8c0', 'conv_1789112261460', 'usr_1789107903795_2402e', '🎯 DIRECT COLLABORATION PITCH\nBrand: Starbucks\nProject: Starbucks\nOffer: ₹5,000\nDeliverables: [\"1x Instagram Reel\"]\n\nNote: hiiii', NULL, '0', '2026-09-11 13:07:41');

-- --------------------------------------------------------
-- Table structure for `notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` text COLLATE utf8mb4_unicode_ci,
  `read_status` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`,`read_status`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `notifications` (4 rows)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `link`, `read_status`, `created_at`) VALUES
('notif_1789044588394_c198', 'usr_creator_1', '🎯 Direct Collaboration Offer from Nykaa!', 'Offer: ₹6,000 for \"Test Collaboration Offer\" (1 Reel + 2 Stories). Review in Applications!', '/creator/dashboard?tab=applications', '0', '2026-09-10 18:19:48'),
('notif_1789044648194_56a2', 'usr_creator_1', '🎯 Direct Collaboration Offer from Nykaa!', 'Offer: ₹7,500 for \"Direct Message Pitch Offer\" (1 Reel + 1 Story). Review in Applications!', '/creator/dashboard?tab=applications', '0', '2026-09-10 18:20:48'),
('notif_1789044745253_94b7', 'usr_1789032139242_ce7b1', '🎯 Direct Collaboration Offer from Myntra!', 'Offer: ₹7,500 for \"Direct Message Pitch Offer\" ([\"1 Reel + 1 Story\"]). Review in Applications!', '/creator/dashboard?tab=applications', '0', '2026-09-10 18:22:25'),
('notif_1789112261498_a5c1', 'usr_1789104353972_5357e', '🎯 Direct Collaboration Offer from Starbucks!', 'Offer: ₹5,000 for \"Starbucks\" ([\"1x Instagram Reel\"]). Review in Applications!', '/creator/dashboard?tab=applications', '0', '2026-09-11 13:07:41');

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collaboration_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewee_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `review_text` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `collaboration_id` (`collaboration_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `reviewee_id` (`reviewee_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `instagram_accounts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `instagram_accounts`;
CREATE TABLE `instagram_accounts` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_user_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_username` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_url` text COLLATE utf8mb4_unicode_ci,
  `account_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'BUSINESS',
  `profile_picture_url` text COLLATE utf8mb4_unicode_ci,
  `biography` text COLLATE utf8mb4_unicode_ci,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `website` text COLLATE utf8mb4_unicode_ci,
  `encrypted_access_token` text COLLATE utf8mb4_unicode_ci,
  `access_token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_expires_at` timestamp NULL DEFAULT NULL,
  `connection_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'CONNECTED',
  `is_connected` int DEFAULT '1',
  `is_realtime_sync` int DEFAULT '1',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `creator_id` (`creator_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_ig_creator_id` (`creator_id`),
  KEY `idx_ig_user_id` (`instagram_user_id`),
  KEY `idx_ig_username` (`instagram_username`),
  CONSTRAINT `instagram_accounts_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instagram_accounts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `instagram_accounts` (5 rows)
INSERT INTO `instagram_accounts` (`id`, `creator_id`, `user_id`, `instagram_user_id`, `instagram_username`, `username`, `full_name`, `profile_url`, `account_type`, `profile_picture_url`, `biography`, `bio`, `website`, `encrypted_access_token`, `access_token`, `token_expires_at`, `connection_status`, `is_connected`, `is_realtime_sync`, `last_synced_at`, `created_at`, `updated_at`) VALUES
('iga_1788949772_0982c', 'crt_chandana_c33894', 'usr_chandana_4d0e63', 'ig_chandana__murthy', 'chandana__murthy', 'chandana__murthy', 'Chandana Murthy', 'https://instagram.com/chandana__murthy', 'DIRECT_LINK', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=fAVbEuflDJhGnDWhZpiS8Q&_nc_ss=7b500&oh=00_AQLl_T72rXfpRfJCE4G6RwV9HpQytmiop3DgnT1bpW3QMg&oe=6AA71598', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', NULL, 'linked_profile', 'linked_profile', NULL, 'CONNECTED', '1', '1', '2026-09-09 15:59:34', '2026-09-09 15:59:32', '2026-09-09 15:59:32'),
('iga_1789019248_1762c', 'crt_1789019210097_4f604', 'usr_1789019209918_a790d', 'ig_chandana__murthy', 'chandana__murthy', 'chandana__murthy', 'Chandana Murthy', 'https://instagram.com/chandana__murthy', 'DIRECT_LINK', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=QQQUuw8-zWTYyTx6Sy9KRw&_nc_ss=7b500&oh=00_AQJkw4P_jjaQs9D32gYGpifacfI17ioCXioVjL3AOljUVw&oe=6AA82ED8', 'Makeup Artist 💄 | Fashion & Lifestyle ✨ | Bangalore 🌸 | DM for Collabs 📩', 'Makeup Artist 💄 | Fashion & Lifestyle ✨ | Bangalore 🌸 | DM for Collabs 📩', NULL, 'linked_profile', 'linked_profile', NULL, 'CONNECTED', '1', '1', '2026-09-10 11:17:30', '2026-09-10 11:17:28', '2026-09-10 11:17:28'),
('iga_1789104780_6c563', 'crt_1789104354104_b8192', 'usr_1789104353972_5357e', 'ig_arpitha____suresh', 'arpitha____suresh', 'arpitha____suresh', 'Arpitha 😊🐾', 'https://instagram.com/arpitha____suresh', 'DIRECT_LINK', 'https://scontent.cdninstagram.com/v/t51.2885-19/280662102_1372076499955771_2471555189896201905_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=105&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=DEOxPea6IfEQ7kNvwHdHf9W&_nc_oc=AdqLasoEyd5pDLgrA-cC8ocBUtuDJQV6ANFnQkK75LnJoswQuNiQ9SHxMImIc5RcNBo&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b500&oh=00_AQKyaKJWWbHwgQAvvtMG1sadgVBu6-F6ublt3XKqAH2LSg&oe=6AA977EF', 'Trusfated😵‍💫\nPètríçhòr🤍\nಮಸಾಲೆ ದೋಸೆ  & ಫಿಲ್ಟರ್ ಕಾಫಿ 🩷\nLive your way, it\'s yours anyway?', 'Trusfated😵‍💫\nPètríçhòr🤍\nಮಸಾಲೆ ದೋಸೆ  & ಫಿಲ್ಟರ್ ಕಾಫಿ 🩷\nLive your way, it\'s yours anyway?', NULL, 'linked_profile', 'linked_profile', NULL, 'CONNECTED', '1', '1', '2026-09-11 11:03:02', '2026-09-11 11:03:00', '2026-09-11 11:03:00'),
('iga_1789112007_19b34', 'crt_1789032139440_cb025', 'usr_1789032139242_ce7b1', 'ig_chandana__murthy', 'chandana__murthy', 'chandana__murthy', 'Chandana Murthy', 'https://instagram.com/chandana__murthy', 'DIRECT_LINK', 'https://scontent.cdninstagram.com/v/t51.82787-19/780056988_18138976525597961_6838253791900545781_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=109&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=YkU5CEuBhvkQ7kNvwFT3eio&_nc_oc=Adr72HNPSWzuQTM6Xs8SaDVyQpba5xpUC25Gh4qwXbmWeAvPLGgWy7v9CK6xyB0EV10&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=mfDMZ5JMbQ4NvsvA7ATkvQ&_nc_ss=7b500&oh=00_AQJER9WzCS73b5GkLnLK-AIUPf6ecMh-QtNsTnMG7NngJw&oe=6AA98058', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', 'ॐ\nDancer by Passion💃🏻\nShe’s poetry in human form 🕊️', NULL, 'linked_profile', 'linked_profile', NULL, 'CONNECTED', '1', '1', '2026-09-11 13:03:31', '2026-09-11 13:03:27', '2026-09-11 13:03:27'),
('iga_test_1788957556', 'crt_1', 'usr_creator_1', 'ig_zara', 'zara', 'zara', 'ZARA', 'https://instagram.com/zara', 'BUSINESS', 'https://scontent.cdninstagram.com/v/t51.2885-19/358807565_255281447246610_5910927613606794914_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=1&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=w2ciU3q5-LsQ7kNvwGZzJob&_nc_oc=Adoc4PwuKwrylk1zqAjnamJDEiVAfSCFQlhv3n9maA_GBFbLWileZjtiuqE1jo785Dc&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b500&oh=00_AQIUZqgAlVMEq5X5lJp3KWaqJNkpoM4OUW3P9IxXB0FfBw&oe=6AA94214', 'For Man collection check @zaraman \nKids collection @zarakids \nCustomer Care @zaracare\nDiscover Woman collection ⬇️', 'For Man collection check @zaraman \nKids collection @zarakids \nCustomer Care @zaracare\nDiscover Woman collection ⬇️', NULL, 'token_demo', 'token_demo', NULL, 'CONNECTED', '1', '1', '2026-09-11 10:25:38', '2026-09-09 18:09:16', '2026-09-09 18:09:16');

-- --------------------------------------------------------
-- Table structure for `instagram_metrics`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `instagram_metrics`;
CREATE TABLE `instagram_metrics` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_account_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `followers_count` int DEFAULT '0',
  `following_count` int DEFAULT '0',
  `follows_count` int DEFAULT '0',
  `media_count` int DEFAULT '0',
  `reach` int DEFAULT '0',
  `impressions` int DEFAULT '0',
  `profile_views` int DEFAULT '0',
  `website_clicks` int DEFAULT '0',
  `engagement_rate` decimal(6,3) DEFAULT '0.000',
  `data_source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Instagram',
  `source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'LIVE_API',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_metrics_account` (`instagram_account_id`,`recorded_at`),
  CONSTRAINT `instagram_metrics_ibfk_1` FOREIGN KEY (`instagram_account_id`) REFERENCES `instagram_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instagram_metrics_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `instagram_metrics` (11 rows)
INSERT INTO `instagram_metrics` (`id`, `instagram_account_id`, `creator_id`, `followers_count`, `following_count`, `follows_count`, `media_count`, `reach`, `impressions`, `profile_views`, `website_clicks`, `engagement_rate`, `data_source`, `source`, `recorded_at`, `created_at`) VALUES
('met_1788949772_link', 'iga_1788949772_0982c', 'crt_chandana_c33894', '476', '462', '0', '54', '857', '1238', '0', '0', '4.370', 'Instagram', 'DIRECT_LINK', '2026-09-09 15:59:32', '2026-09-09 15:59:32'),
('met_1788949774_d88bd', 'iga_1788949772_0982c', 'crt_chandana_c33894', '476', '462', '0', '54', '857', '1238', '0', '0', '4.370', 'Sync Refresh', 'SYNC', '2026-09-09 15:59:34', '2026-09-09 15:59:34'),
('met_1788957556', 'iga_test_1788957556', 'crt_1', '62000000', '171', '0', '5397', '111600000', '161200000', '0', '0', '2.800', 'Meta Graph API v19.0', 'LIVE_SYNC', '2026-09-09 18:09:16', '2026-09-09 18:09:16'),
('met_1789019248_link', 'iga_1789019248_1762c', 'crt_1789019210097_4f604', '475', '462', '0', '54', '855', '1235', '0', '0', '4.380', 'Instagram', 'DIRECT_LINK', '2026-09-10 11:17:28', '2026-09-10 11:17:28'),
('met_1789019250_2ebc8', 'iga_1789019248_1762c', 'crt_1789019210097_4f604', '475', '462', '0', '54', '855', '1235', '0', '0', '4.380', 'Sync Refresh', 'SYNC', '2026-09-10 11:17:30', '2026-09-10 11:17:30'),
('met_1789032075', 'iga_test_1788957556', 'crt_1', '62000000', '171', '0', '5399', '111600000', '161200000', '0', '0', '2.800', 'Meta Graph API v19.0', 'LIVE_SYNC', '2026-09-10 14:51:15', '2026-09-10 14:51:15'),
('met_1789102538', 'iga_test_1788957556', 'crt_1', '62000000', '171', '0', '5398', '111600000', '161200000', '0', '0', '2.800', 'Meta Graph API v19.0', 'LIVE_SYNC', '2026-09-11 10:25:38', '2026-09-11 10:25:38'),
('met_1789104780_link', 'iga_1789104780_6c563', 'crt_1789104354104_b8192', '361', '1352', '0', '47', '650', '939', '0', '0', '8.500', 'Instagram', 'DIRECT_LINK', '2026-09-11 11:03:00', '2026-09-11 11:03:00'),
('met_1789104782_345c7', 'iga_1789104780_6c563', 'crt_1789104354104_b8192', '361', '1352', '0', '47', '650', '939', '0', '0', '8.500', 'Sync Refresh', 'SYNC', '2026-09-11 11:03:02', '2026-09-11 11:03:02'),
('met_1789112007_link', 'iga_1789112007_19b34', 'crt_1789032139440_cb025', '475', '462', '0', '54', '855', '1235', '0', '0', '4.380', 'Instagram', 'DIRECT_LINK', '2026-09-11 13:03:27', '2026-09-11 13:03:27'),
('met_1789112011_e7e35', 'iga_1789112007_19b34', 'crt_1789032139440_cb025', '475', '462', '0', '54', '855', '1235', '0', '0', '4.380', 'Sync Refresh', 'SYNC', '2026-09-11 13:03:31', '2026-09-11 13:03:31');

-- --------------------------------------------------------
-- Table structure for `instagram_media`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `instagram_media`;
CREATE TABLE `instagram_media` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_account_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_media_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `media_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `media_type` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'IMAGE',
  `media_url` text COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` text COLLATE utf8mb4_unicode_ci,
  `permalink` text COLLATE utf8mb4_unicode_ci,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `like_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `comment_count` int DEFAULT '0',
  `view_count` int DEFAULT '0',
  `reach` int DEFAULT '0',
  `impressions` int DEFAULT '0',
  `saved_count` int DEFAULT '0',
  `shares` int DEFAULT '0',
  `data_source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'Instagram',
  `source` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT 'LIVE_API',
  `last_synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_media_account` (`instagram_account_id`,`timestamp`),
  KEY `idx_media_ig_id` (`instagram_media_id`),
  CONSTRAINT `instagram_media_ibfk_1` FOREIGN KEY (`instagram_account_id`) REFERENCES `instagram_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instagram_media_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `instagram_insights`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `instagram_insights`;
CREATE TABLE `instagram_insights` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_account_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'day',
  `value` decimal(12,2) DEFAULT '0.00',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `instagram_account_id` (`instagram_account_id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `instagram_insights_ibfk_1` FOREIGN KEY (`instagram_account_id`) REFERENCES `instagram_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `instagram_insights_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `instagram_sync_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `instagram_sync_logs`;
CREATE TABLE `instagram_sync_logs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_account_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `records_updated` int DEFAULT '0',
  `error_code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_sync_logs_account` (`instagram_account_id`,`started_at`),
  CONSTRAINT `instagram_sync_logs_ibfk_1` FOREIGN KEY (`instagram_account_id`) REFERENCES `instagram_accounts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `instagram_sync_logs_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `ai_creator_analyses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ai_creator_analyses`;
CREATE TABLE `ai_creator_analyses` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overall_score` int NOT NULL,
  `engagement_score` int NOT NULL,
  `consistency_score` int NOT NULL,
  `content_score` int NOT NULL,
  `audience_score` int NOT NULL,
  `brand_suitability_score` int NOT NULL,
  `strengths_json` text COLLATE utf8mb4_unicode_ci,
  `weaknesses_json` text COLLATE utf8mb4_unicode_ci,
  `recommendations_json` text COLLATE utf8mb4_unicode_ci,
  `content_insights_json` text COLLATE utf8mb4_unicode_ci,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `creator_id` (`creator_id`),
  KEY `idx_ai_creator_id` (`creator_id`),
  CONSTRAINT `ai_creator_analyses_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `ai_creator_analyses` (5 rows)
INSERT INTO `ai_creator_analyses` (`id`, `creator_id`, `overall_score`, `engagement_score`, `consistency_score`, `content_score`, `audience_score`, `brand_suitability_score`, `strengths_json`, `weaknesses_json`, `recommendations_json`, `content_insights_json`, `summary`, `analyzed_at`) VALUES
('ai_crt_1', 'crt_1', '85', '76', '85', '88', '84', '90', '[\"High follower interaction relative to community size\",\"Consistent brand aesthetics and visual identity\",\"Strong alignment with lifestyle and regional consumer trends\"]', '[\"Publishing frequency can be increased to 4x\\/week\",\"Opportunity to expand into interactive poll and Q&A formats\"]', '[\"Focus on short-form Reels with hook-driven first 3 seconds\",\"Highlight verified collaborations in featured story highlights\"]', '[\"Reels generate 2.8x more engagement than static images\",\"Peak audience active hours: 7:00 PM - 10:00 PM IST\"]', 'Verified creator demonstrating strong audience loyalty with an authentic engagement rate of 3.8% and positive brand affinity.', '2026-09-09 17:59:07'),
('ai_crt_1789019210097_4f604', 'crt_1789019210097_4f604', '85', '88', '85', '88', '72', '90', '[\"High follower interaction relative to community size\",\"Consistent brand aesthetics and visual identity\",\"Strong alignment with lifestyle and regional consumer trends\"]', '[\"Publishing frequency can be increased to 4x\\/week\",\"Opportunity to expand into interactive poll and Q&A formats\"]', '[\"Focus on short-form Reels with hook-driven first 3 seconds\",\"Highlight verified collaborations in featured story highlights\"]', '[\"Reels generate 2.8x more engagement than static images\",\"Peak audience active hours: 7:00 PM - 10:00 PM IST\"]', 'Verified creator demonstrating strong audience loyalty with an authentic engagement rate of 4.38% and positive brand affinity.', '2026-09-11 10:25:34'),
('ai_crt_1789032139440_cb025', 'crt_1789032139440_cb025', '85', '88', '85', '88', '72', '90', '[\"High follower interaction relative to community size\",\"Consistent brand aesthetics and visual identity\",\"Strong alignment with lifestyle and regional consumer trends\"]', '[\"Publishing frequency can be increased to 4x\\/week\",\"Opportunity to expand into interactive poll and Q&A formats\"]', '[\"Focus on short-form Reels with hook-driven first 3 seconds\",\"Highlight verified collaborations in featured story highlights\"]', '[\"Reels generate 2.8x more engagement than static images\",\"Peak audience active hours: 7:00 PM - 10:00 PM IST\"]', 'Verified creator demonstrating strong audience loyalty with an authentic engagement rate of 4.38% and positive brand affinity.', '2026-09-10 16:57:06'),
('ai_crt_1789104354104_b8192', 'crt_1789104354104_b8192', '85', '76', '85', '88', '84', '90', '[\"High follower interaction relative to community size\",\"Consistent brand aesthetics and visual identity\",\"Strong alignment with lifestyle and regional consumer trends\"]', '[\"Publishing frequency can be increased to 4x\\/week\",\"Opportunity to expand into interactive poll and Q&A formats\"]', '[\"Focus on short-form Reels with hook-driven first 3 seconds\",\"Highlight verified collaborations in featured story highlights\"]', '[\"Reels generate 2.8x more engagement than static images\",\"Peak audience active hours: 7:00 PM - 10:00 PM IST\"]', 'Verified creator demonstrating strong audience loyalty with an authentic engagement rate of 3.8% and positive brand affinity.', '2026-09-11 10:55:56'),
('ai_crt_chandana_c33894', 'crt_chandana_c33894', '85', '76', '85', '88', '84', '90', '[\"High follower interaction relative to community size\",\"Consistent brand aesthetics and visual identity\",\"Strong alignment with lifestyle and regional consumer trends\"]', '[\"Publishing frequency can be increased to 4x\\/week\",\"Opportunity to expand into interactive poll and Q&A formats\"]', '[\"Focus on short-form Reels with hook-driven first 3 seconds\",\"Highlight verified collaborations in featured story highlights\"]', '[\"Reels generate 2.8x more engagement than static images\",\"Peak audience active hours: 7:00 PM - 10:00 PM IST\"]', 'Verified creator demonstrating strong audience loyalty with an authentic engagement rate of 3.8% and positive brand affinity.', '2026-09-09 15:59:07');

-- --------------------------------------------------------
-- Table structure for `locations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Karnataka',
  `lat` decimal(10,6) NOT NULL,
  `lng` decimal(10,6) NOT NULL,
  `is_active` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `locations` (5 rows)
INSERT INTO `locations` (`id`, `name`, `city`, `state`, `lat`, `lng`, `is_active`) VALUES
('loc_1', 'Indiranagar 100ft Road', 'Bengaluru', 'Karnataka', '12.978400', '77.640800', '1'),
('loc_2', 'Koramangala 80ft Road', 'Bengaluru', 'Karnataka', '12.935200', '77.624500', '1'),
('loc_3', 'HSR Layout 27th Main', 'Bengaluru', 'Karnataka', '12.912100', '77.644600', '1'),
('loc_4', 'Church Street MG Road', 'Bengaluru', 'Karnataka', '12.974900', '77.604500', '1'),
('loc_5', 'Whitefield ITPL Main Rd', 'Bengaluru', 'Karnataka', '12.989200', '77.728900', '1');

-- --------------------------------------------------------
-- Table structure for `admin_actions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_actions`;
CREATE TABLE `admin_actions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details_json` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_user_id` (`admin_user_id`),
  CONSTRAINT `admin_actions_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `admin_actions` (15 rows)
INSERT INTO `admin_actions` (`id`, `admin_user_id`, `action_type`, `target_type`, `target_id`, `details_json`, `created_at`) VALUES
('act_1789041214203_e38b', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_1789032139242_ce7b1', '{\"is_active\":0}', '2026-09-10 17:23:34'),
('act_1789041219092_35ee', 'usr_admin_1', 'ACTIVATE_USER', 'user', 'usr_1789032139242_ce7b1', '{\"is_active\":1}', '2026-09-10 17:23:39'),
('act_1789102097728_20b8', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_brand_lakme', '{\"is_active\":0}', '2026-09-11 10:18:17'),
('act_1789102106592_e372', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_1789034036677_937e8', '{\"is_active\":0}', '2026-09-11 10:18:26'),
('act_1789102462232_d0d8', 'usr_admin_1', 'PAUSE_CAMPAIGN', 'campaign', 'cmp_1789043960992_a3627', '{\"status\":\"PAUSED\"}', '2026-09-11 10:24:22'),
('act_1789102513324_eeed', 'usr_admin_1', 'PAUSE_CAMPAIGN', 'campaign', 'cmp_1789043960992_a3627', '{\"status\":\"PAUSED\"}', '2026-09-11 10:25:13'),
('act_1789102513353_9836', 'usr_admin_1', 'UPDATE_CAMPAIGN_STATUS', 'campaign', 'cmp_1789043960992_a3627', '{\"status\":\"PUBLISHED\"}', '2026-09-11 10:25:13'),
('act_1789102513468_b127', 'usr_admin_1', 'UPDATE_CAMPAIGN_STATUS', 'campaign', 'cmp_1789043960992_a3627', '{\"status\":\"PUBLISHED\"}', '2026-09-11 10:25:13'),
('act_1789102576179_b6d2', 'usr_admin_1', 'PAUSE_CAMPAIGN', 'campaign', 'cmp_pitch_1789044588287_d819', '{\"status\":\"PAUSED\"}', '2026-09-11 10:26:16'),
('act_1789102578123_6470', 'usr_admin_1', 'PAUSE_CAMPAIGN', 'campaign', 'cmp_pitch_1789044648113_1dc3', '{\"status\":\"PAUSED\"}', '2026-09-11 10:26:18'),
('act_1789102579671_694c', 'usr_admin_1', 'PAUSE_CAMPAIGN', 'campaign', 'cmp_1789043960992_a3627', '{\"status\":\"PAUSED\"}', '2026-09-11 10:26:19'),
('act_1789102644459_378e', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_1789019209918_a790d', '{\"is_active\":0}', '2026-09-11 10:27:24'),
('act_1789102650993_9846', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_chandana_4d0e63', '{\"is_active\":0}', '2026-09-11 10:27:30'),
('act_1789110145161_490d', 'usr_admin_1', 'ACTIVATE_USER', 'user', 'usr_chandana_4d0e63', '{\"is_active\":1}', '2026-09-11 12:32:25'),
('act_1789110154786_bbaa', 'usr_admin_1', 'SUSPEND_USER', 'user', 'usr_chandana_4d0e63', '{\"is_active\":0}', '2026-09-11 12:32:34');

-- --------------------------------------------------------
-- Table structure for `oauth_states`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `oauth_states`;
CREATE TABLE `oauth_states` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_token` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `state_token` (`state_token`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_oauth_states_token` (`state_token`),
  CONSTRAINT `oauth_states_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `creator_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for `oauth_states` (5 rows)
INSERT INTO `oauth_states` (`id`, `creator_id`, `state_token`, `expires_at`, `created_at`) VALUES
('state_1788956945_ig_sta', 'crt_1', 'ig_state_4d36323c653c244905dde1341ec1582d', '2026-09-09 18:14:05', '2026-09-09 17:59:05'),
('state_1788957554_ig_sta', 'crt_1', 'ig_state_d1c64d3013a3c1702d0408fe79dab7f1', '2026-09-09 18:24:14', '2026-09-09 18:09:14'),
('state_1789032073_ig_sta', 'crt_1', 'ig_state_85c7c6edf0779fa362f41dadb5da581b', '2026-09-10 15:06:13', '2026-09-10 14:51:13'),
('state_1789102533_ig_sta', 'crt_1789019210097_4f604', 'ig_state_31de230385c6aa8ca21674b2f12482a8', '2026-09-11 10:40:33', '2026-09-11 10:25:33'),
('state_1789102536_ig_sta', 'crt_1', 'ig_state_f601c4834ed26e175ce8e7139204707d', '2026-09-11 10:40:36', '2026-09-11 10:25:36');

-- --------------------------------------------------------
-- Table structure for `refresh_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `refresh_logs`;
CREATE TABLE `refresh_logs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instagram_account_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metrics_updated_count` int DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `sync_duration_ms` int DEFAULT '0',
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refresh_creator` (`creator_id`,`logged_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `contact_inquiries`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contact_inquiries`;
CREATE TABLE `contact_inquiries` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT 'unread',
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
