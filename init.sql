-- Base de données AMOUCH - Plateforme Vétérinaire & Adoption
CREATE DATABASE IF NOT EXISTS amouch_db;
USE amouch_db;

CREATE TABLE IF NOT EXISTS animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    age_years INT,
    age_months INT,
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    weight DECIMAL(5, 2),
    color VARCHAR(50),
    price DECIMAL(10, 2),
    description TEXT,
    image_url VARCHAR(255),
    status ENUM('available', 'reserved', 'adopted', 'medical_care', 'quarantine') DEFAULT 'available',
    adoption_status ENUM('adoptable', 'not_adoptable', 'adopted', 'pending') DEFAULT 'not_adoptable',
    health_status ENUM('healthy', 'sick', 'recovering', 'critical') DEFAULT 'healthy',
    behavioral_notes TEXT,
    special_needs TEXT,
    shelter_id INT,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    reservation_date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    supplier VARCHAR(100),
    min_quantity INT DEFAULT 10,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    visit_date DATE NOT NULL,
    veterinarian_name VARCHAR(100),
    diagnosis TEXT,
    treatment TEXT,
    prescriptions TEXT,
    notes TEXT,
    next_visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    veterinarian VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('antibiotic', 'painkiller', 'vaccine', 'supplement', 'antiparasitic', 'other') NOT NULL,
    description TEXT,
    dosage_info TEXT,
    side_effects TEXT,
    stock_quantity INT DEFAULT 0,
    unit_price DECIMAL(10, 2),
    expiry_date DATE,
    manufacturer VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    medication_id INT NOT NULL,
    prescribed_by VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);

CREATE TABLE IF NOT EXISTS adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    adopter_name VARCHAR(100) NOT NULL,
    adopter_email VARCHAR(100) NOT NULL,
    adopter_phone VARCHAR(20),
    adopter_address TEXT,
    adoption_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    home_visit_required BOOLEAN DEFAULT TRUE,
    home_visit_date DATE,
    adoption_fee DECIMAL(10, 2) DEFAULT 0.00,
    contract_signed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS awareness_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('health', 'adoption', 'education', 'prevention', 'welfare') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    target_audience VARCHAR(100),
    content TEXT,
    image_url VARCHAR(255),
    banner_image_url VARCHAR(255),
    location VARCHAR(200),
    priority INT DEFAULT 0,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_by VARCHAR(100),
    created_by_user_id INT,
    tags VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    user_id INT,
    user_email VARCHAR(100),
    interaction_type ENUM('like', 'view', 'share') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES awareness_campaigns(id) ON DELETE CASCADE,
    UNIQUE KEY unique_interaction (campaign_id, user_email, interaction_type)
);

CREATE TABLE IF NOT EXISTS campaign_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    user_id INT,
    user_name VARCHAR(100),
    user_email VARCHAR(100),
    comment TEXT NOT NULL,
    approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES awareness_campaigns(id) ON DELETE CASCADE
);

INSERT INTO animals (name, species, breed, age_years, age_months, gender, weight, color, price, description, status, adoption_status, health_status) VALUES
('Aziz', 'Chien', 'Sloughi', 2, 3, 'male', 28.5, 'Beige', NULL, 'Lévrier marocain élégant et affectueux, parfait pour une famille', 'available', 'adoptable', 'healthy'),
('Aicha', 'Chat', 'Chat de rue marocain', 1, 6, 'female', 3.8, 'Tigré', NULL, 'Chatte calme et douce, adaptée à la vie en appartement', 'available', 'adoptable', 'healthy'),
('Brahim', 'Chien', 'Berger de l\'Atlas', 3, 0, 'male', 35.2, 'Noir et blanc', NULL, 'Chien fidèle et protecteur, excellent gardien', 'medical_care', 'pending', 'recovering'),
('Fatima', 'Chat', 'Chat marocain', 0, 8, 'female', 2.1, 'Roux', NULL, 'Chaton très joueur et curieux, plein d\'énergie', 'available', 'adoptable', 'healthy');

INSERT INTO medications (name, type, description, dosage_info, stock_quantity, unit_price, requires_prescription) VALUES
('Amoxicilline', 'antibiotic', 'Antibiotique à large spectre', '10mg/kg deux fois par jour', 50, 250.00, TRUE),
('Vaccin Rage', 'vaccine', 'Vaccin contre la rage', 'Une injection annuelle', 30, 450.00, TRUE),
('Vermifuge', 'antiparasitic', 'Traitement antiparasitaire', 'Selon le poids de l\'animal', 100, 150.00, FALSE),
('Anti-inflammatoire', 'painkiller', 'Soulagement de la douleur', '5mg/kg par jour', 60, 180.00, TRUE);

INSERT INTO vaccinations (animal_id, vaccine_name, vaccination_date, next_due_date, veterinarian) VALUES
(1, 'Rage', '2024-01-15', '2025-01-15', 'Dr. Fatima Benali'),
(1, 'DHPP', '2024-01-15', '2025-01-15', 'Dr. Fatima Benali'),
(2, 'Rage', '2024-02-20', '2025-02-20', 'Dr. Fatima Benali');

INSERT INTO medical_records (animal_id, visit_date, veterinarian_name, diagnosis, treatment, notes) VALUES
(3, '2024-10-15', 'Dr. Fatima Benali', 'Fracture patte avant', 'Plâtre et repos', 'Récupération en cours, contrôle dans 2 semaines');

INSERT INTO awareness_campaigns (title, description, category, start_date, status, content, tags, featured, location, target_audience, views_count, likes_count) VALUES
('تبنّ ولا تشترِ - Adoptez, ne achetez pas', 'حملة لتشجيع تبني الحيوانات المتروكة في المغرب', 'adoption', '2024-10-01', 'active', 'كل عام، آلاف الحيوانات تنتظر عائلة محبة في الملاجئ في جميع أنحاء المغرب. التبني مجاني ويعطي حياة جديدة لحيوان محتاج. تعالوا لننقذ حياة معاً!', 'تبني,حيوانات,المغرب,refuge,adoption', TRUE, 'المغرب - Maroc', 'جميع العائلات المغربية', 1250, 89),
('التطعيم: احمِ حيوانك - Vaccination: Protégez votre animal', 'حملة توعوية حول أهمية التطعيم في المغرب', 'health', '2024-09-15', 'active', 'التطعيم ضروري لحماية حيوانك من الأمراض الخطيرة. في المغرب، يُنصح بتطعيم الكلاب ضد داء الكلب سنويًا. احمِ حيوانك وعائلتك من خلال التطعيم المنتظم.', 'تطعيم,صحة,كلب,قطة,vaccination,santé', TRUE, 'Casablanca, Rabat, Marrakech', 'أصحاب الحيوانات الأليفة', 890, 67),
('رعاية الحيوانات في الصيف - Soins d été', 'نصائح مهمة لحماية الحيوانات من الحرارة', 'welfare', '2024-06-01', 'active', 'الصيف في المغرب حار جداً. تأكدوا من توفير الماء الكافي لحيواناتكم وعدم تركها في السيارات. وفرّوا الظل وتهوية جيدة.', 'صيف,حرارة,رعاية,été,soins', FALSE, 'جميع مناطق المغرب', 'أصحاب الحيوانات', 450, 34),
('التعليم حول المسؤولية - Responsabilité Animale', 'تعليم الأطفال والكبار كيفية التعامل مع الحيوانات', 'education', '2024-01-10', 'active', 'تعليم الأطفال احترام الحيوانات والتعامل معها بطريقة مسؤولة يخلق جيلاً واعياً. نظمنا ورش عمل في المدارس والجمعيات.', 'تعليم,أطفال,مسؤولية,éducation,enfants', FALSE, 'المدارس المغربية', 'الأطفال وأولياء الأمور', 670, 45),
('منع الإساءة للحيوانات - Prévention Cruauté', 'حملة لمنع إساءة معاملة الحيوانات', 'prevention', '2024-03-20', 'active', 'الإساءة للحيوانات جريمة. إذا شاهدتم حيواناً يتعرض للإساءة، اتصلوا بالسلطات المختصة. نحن معاً لحماية الحيوانات.', 'منع,إساءة,حماية,prévention,protection', FALSE, 'المغرب كاملاً', 'الجميع', 520, 38),
('دليل الرعاية الأساسية للكلاب - Guide Soins Chiens', 'دليل شامل لرعاية الكلاب في المغرب', 'education', '2024-01-01', 'active', 'الكلاب تحتاج إلى رعاية يومية شاملة:\n\n✅ التغذية المتوازنة: اختاروا الطعام المناسب لعمر ووزن كلبكم\n✅ التطعيمات: التطعيم ضد داء الكلب إجباري في المغرب\n✅ التمرين: الكلاب تحتاج إلى المشي اليومي 30-60 دقيقة\n✅ النظافة: الاستحمام كل 2-4 أسابيع، تنظيف الأسنان أسبوعياً\n✅ الفحص الطبي: زيارة الطبيب البيطري سنوياً\n✅ التربية: الترويض والتنشئة الاجتماعية مهمة\n\nالكلمات المفتاحية: croquettes de qualité, promenades quotidiennes, vaccination antirabique, brossage des dents', 'كلاب,رعاية,دليل,chiens,soins,guide', TRUE, 'المغرب', 'أصحاب الكلاب الجدد', 1120, 98),
('دليل رعاية القطط - Guide Soins Chats', 'كل ما تحتاج معرفته عن رعاية القطط', 'education', '2024-02-01', 'active', 'القطط حيوانات مستقلة ولكنها تحتاج رعاية:\n\n✅ التغذية: الطعام المخصص للقطط، الماء العذب دائماً\n✅ النظافة: صندوق الرمل نظيف يومياً\n✅ التطعيم: ضد داء الكلب والأمراض الشائعة\n✅ التعقيم: مهم للصحة ومنع الإنجاب غير المرغوب\n✅ اللعب: القطط تحتاج ألعاب تفاعلية يومياً\n✅ المخالب: توفير عمود خدش يحمي الأثاث\n✅ الفحص: مراقبة الوزن والصحة العامة\n\nLes chats ont besoin d''un environnement enrichi avec des jouets, griffoirs et cachettes.', 'قطط,رعاية,دليل,chats,soins,guide', TRUE, 'المغرب', 'أصحاب القطط', 980, 76),
('علامات الصحة في الحيوانات - Signes de Santé', 'كيف تعرف أن حيوانك بصحة جيدة', 'health', '2024-03-01', 'active', 'مراقبة صحة حيوانك يومياً:\n\n🟢 علامات الصحة الجيدة:\n- الشهية الطبيعية\n- الطاقة والنشاط\n- العيون اللامعة\n- الأنف الرطب (للكلاب)\n- الفراء اللامع\n- الوزن المثالي\n\n🔴 علامات التحذير (استشارة طبيب):\n- فقدان الشهية أكثر من 24 ساعة\n- الخمول والاكتئاب\n- القيء أو الإسهال المتكرر\n- صعوبة التنفس\n- تغيرات في الوزن\n- العطش المفرط\n- تغيرات سلوكية مفاجئة\n\nVérifiez régulièrement: température, fréquence cardiaque, hydratation', 'صحة,علامات,مراقبة,santé,signes', FALSE, 'المغرب', 'جميع أصحاب الحيوانات', 750, 62),
('التغذية السليمة للحيوانات - Alimentation Saine', 'نصائح حول التغذية المتوازنة', 'health', '2024-04-01', 'active', 'التغذية السليمة أساس صحة الحيوان:\n\n🍽️ للكلاب:\n- البروتينات عالية الجودة (لحوم)\n- الكربوهيدرات (أرز، بطاطا)\n- الخضروات (جزر، بروكلي)\n- تجنب: الشوكولاتة، البصل، الثوم، العنب\n- 2-3 وجبات يومياً حسب العمر\n\n🐱 للقطط:\n- طعام غني بالبروتين الحيواني\n- التورين ضروري للقطط\n- الماء العذب دائماً (لا الحليب)\n- وجبات صغيرة متكررة\n\n⚠️ الأطعمة الممنوعة:\nالشوكولاتة، الأطعمة الحلوة، الملح الزائد، العظام المطبوخة\n\nPortions adaptées à l''âge, poids et activité physique', 'تغذية,صحة,كلب,قطة,alimentation,nutrition', FALSE, 'المغرب', 'أصحاب الحيوانات', 680, 54),
('الترويض الإيجابي - Dressage Positif', 'أساليب التربية الحديثة للكلاب', 'education', '2024-05-01', 'active', 'الترويض الإيجابي يعزز العلاقة مع كلبك:\n\n✅ مبادئ الترويض الإيجابي:\n- المكافآت بدلاً من العقاب\n- الصبر والثبات\n- جلسات قصيرة (10-15 دقيقة)\n- إشارات واضحة ومتسقة\n\n📚 الأوامر الأساسية:\n- "اجلس": جلسة كلبك\n- "تعال": دعوة الكلب إليك\n- "ابق": البقاء في المكان\n- "لا": منع سلوك غير مرغوب\n\n⏰ متى تبدأ:\n- الجراء: من 8 أسابيع\n- كل أسبوع: تعلم أمر جديد\n- التدريب اليومي: 5-10 دقائق\n\n❌ تجنب:\n- العقاب الجسدي\n- الصراخ المستمر\n- التوقعات غير الواقعية\n\nLe dressage positif renforce la confiance et le lien avec votre chien.', 'ترويض,تربية,كلاب,dressage,éducation,chiens', FALSE, 'المغرب', 'أصحاب الكلاب الجدد', 560, 48),
('رعاية الحيوانات المسنة - Soins Animaux Âgés', 'دعم الحيوانات الكبيرة في السن', 'welfare', '2024-07-01', 'active', 'الحيوانات المسنة تحتاج رعاية خاصة:\n\n👴 متى يكون الحيوان مسناً:\n- الكلاب: من 7-10 سنوات (حسب السلالة)\n- القطط: من 8-10 سنوات\n\n🔍 علامات الشيخوخة:\n- بطء الحركة\n- مشاكل في الرؤية/السمع\n- صعوبة في القفز\n- زيادة الوزن أو نقصانه\n- تغيرات في النوم\n\n💊 الرعاية المطلوبة:\n- فحص طبي كل 6 أشهر\n- نظام غذائي للكبار\n- مكملات المفاصل\n- التكيف البيئي (أسرة ناعمة، منحدرات)\n- الصبر والتفهم\n\n🏥 مشاكل شائعة:\n- التهاب المفاصل\n- مشاكل الكلى\n- مشاكل الأسنان\n- ضعف الإبصار\n\nConsultez régulièrement le vétérinaire et adaptez l''environnement.', 'شيخوخة,رعاية,مسن,âge,soins', FALSE, 'المغرب', 'أصحاب الحيوانات المسنة', 420, 35),
('السلوك الطبيعي للحيوانات - Comportement Normal', 'فهم سلوك حيوانك الأليف', 'education', '2024-08-01', 'active', 'فهم السلوك الطبيعي يساعدك على اكتشاف المشاكل:\n\n🐕 سلوك الكلاب الطبيعي:\n- الذيل المرتفع = السعادة\n- الذيل المنخفض = الخوف/القلق\n- النباح = تنبيه، لعب، أو قلق\n- لعق = المودة أو التوتر\n- حك الأرض بعد التبرز = تمييز المنطقة\n\n🐱 سلوك القطط الطبيعي:\n- الخرخرة = الرضا أو التوتر\n- الذيل المرتفع = الصداقة\n- الذيل المنتصب = التحذير\n- الخدش = تحديد المنطقة\n- التدحرج = طلب اللعب/المودة\n\n⚠️ سلوك غير طبيعي:\n- العدوانية المفاجئة\n- الاختباء المستمر\n- عدم الأكل لأكثر من يوم\n- التبول خارج الصندوق\n- العض أو الخدش المفرط\n\nComportement = communication. Observez votre animal pour mieux le comprendre.', 'سلوك,تربية,فهم,comportement,éducation', FALSE, 'المغرب', 'أصحاب الحيوانات', 590, 52),
('الطوارئ البيطرية - Urgences Vétérinaires', 'متى تطلب مساعدة طبية عاجلة', 'prevention', '2024-09-01', 'active', '⚠️ حالات الطوارئ البيطرية:\n\n🚨 حالات عاجلة (توجه فوري للطبيب):\n- صعوبة التنفس\n- الجروح العميقة أو النزيف\n- فقدان الوعي\n- التسمم المشتبه\n- انتفاخ البطن المفاجئ\n- الإصابات الرضحية (حادث)\n- نوبات التشنج\n- عدم القدرة على التبول\n\n📞 تحضير الطوارئ:\n- رقم الطبيب البيطري على الأقرب\n- عيادة الطوارئ 24/7\n- صندوق الإسعافات الأولية\n- سجل التطعيمات\n\n🏥 الإسعافات الأولية:\n- إيقاف النزيف بالضغط\n- تهدئة الحيوان\n- عدم إعطاء أدوية بشرية\n- نقل آمن إلى العيادة\n\n⚠️ لا تترددوا - الوقت ذهب!\n\nEn cas de doute, consultez immédiatement un vétérinaire.', 'طوارئ,عاجل,صحة,urgence,vétérinaire', TRUE, 'المغرب', 'جميع أصحاب الحيوانات', 1300, 115),
('التعايش بين الأطفال والحيوانات - Enfants et Animaux', 'نصائح لسلامة الأطفال والحيوانات', 'education', '2024-10-15', 'active', 'السلامة أولاً عند جمع الأطفال والحيوانات:\n\n👶 للأطفال الصغار:\n- الإشراف الدائم\n- تعليم الاحترام منذ الصغر\n- عدم ترك الطفل والحيوان وحدهما\n- تعليم اللمس اللطيف\n\n📚 قواعد مهمة:\n- لا تزعج الحيوان أثناء الأكل/النوم\n- لا تسحب الذيل/الأذن\n- لا تزعج الحيوان في قفصه\n- تعليم قراءة لغة الجسد\n\n✅ فوائد التعايش:\n- تنمية المسؤولية\n- تعزيز التعاطف\n- تقليل التوتر\n\n🎓 عمر مناسب:\n- الأطفال 5+ سنوات: يمكن التفاعل مع إشراف\n- الأطفال 8+ سنوات: مسؤوليات بسيطة\n- المراهقون: مسؤوليات أكبر\n\nEnseignez le respect mutuel entre enfants et animaux.', 'أطفال,سلامة,تربية,enfants,sécurité', FALSE, 'المغرب', 'الأسر مع الأطفال', 710, 58),
('السلالات المحلية في المغرب - Races Locales', 'اكتشف سلالات الكلاب والقطط المغربية', 'education', '2024-11-01', 'active', 'المغرب موطن لسلالات فريدة:\n\n🐕 سلالات الكلاب المغربية:\n\n1. السلوقي (Sloughi):\n- كلب صيد أصيل ونبيل\n- نشط ورياضي\n- يحتاج تمرين يومي\n- ودود مع العائلة\n\n2. آيدي (Aïdi):\n- كلب حراسة جبلي\n- شجاع ووقائي\n- يحتاج مساحات كبيرة\n- مخلص لعائلته\n\n3. الكلاب المغربية المختلطة:\n- مقاومة للأمراض\n- تكيف عالي\n- شخصيات فريدة\n- ممتازة كحيوانات أليفة\n\n🐱 القطط المغربية:\n- قطط الشوارع المحلية\n- مستقلة ونظيفة\n- صيادون ماهرون\n- مناسبة للبيوت\n\n💡 نصيحة: تبني حيوان محلي = دعم الحيوانات المحلية!\n\nLes races locales sont bien adaptées au climat et à l''environnement marocain.', 'سلالات,محلي,مغرب,races,local,maroc', FALSE, 'المغرب', 'متبنيين محتملين', 640, 49);

INSERT INTO stocks (product_name, category, quantity, unit_price, supplier, min_quantity, description) VALUES
('Croquettes Premium Chien', 'Alimentation', 50, 450.00, 'VetMaroc Casablanca', 10, 'Croquettes haute qualité pour chiens - ماركة مغربية'),
('Litière Chat', 'Hygiène', 30, 120.00, 'PetShop Rabat', 15, 'Litière absorbante pour chats - صنع في المغرب'),
('Jouet Balle', 'Accessoires', 100, 35.00, 'Fournisseur Marrakech', 20, 'Balle interactive pour chiens'),
('Seringues 5ml', 'Matériel Médical', 200, 8.00, 'MedSupply Morocco', 50, 'Seringues stériles usage vétérinaire'),
('Collier Élisabéthain', 'Matériel Médical', 25, 85.00, 'VetEquipment Casablanca', 10, 'Collier de protection post-opératoire');


-- Table Utilisateurs (pour authentification et rôles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('adopter', 'shelter', 'veterinarian', 'admin') NOT NULL,
    address TEXT,
    profile_image VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Refuges (profils détaillés)
CREATE TABLE IF NOT EXISTS shelters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shelter_name VARCHAR(200) NOT NULL,
    license_number VARCHAR(100),
    location VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    capacity INT,
    opening_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table Vétérinaires (profils détaillés)
CREATE TABLE IF NOT EXISTS veterinarians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    clinic_name VARCHAR(200),
    clinic_address TEXT,
    city VARCHAR(100),
    consultation_fee DECIMAL(10, 2),
    teleconsultation_available BOOLEAN DEFAULT TRUE,
    teleconsultation_fee DECIMAL(10, 2),
    years_experience INT,
    bio TEXT,
    working_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table Rendez-vous Vétérinaires
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT,
    user_id INT NOT NULL,
    veterinarian_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    appointment_type ENUM('consultation', 'vaccination', 'surgery', 'checkup', 'emergency', 'teleconsultation') NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    video_link VARCHAR(255),
    duration_minutes INT DEFAULT 30,
    fee DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE
);

-- Table Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT,
    animal_id INT NOT NULL,
    veterinarian_id INT NOT NULL,
    prescription_date DATE NOT NULL,
    medication_id INT,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INT,
    instructions TEXT,
    refills_allowed INT DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
);

-- Table Messages/Chat
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    conversation_id VARCHAR(100),
    animal_id INT,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type ENUM('text', 'image', 'document') DEFAULT 'text',
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL
);

-- Table Historique des Animaux
CREATE TABLE IF NOT EXISTS animal_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    event_type ENUM('arrival', 'medical_treatment', 'vaccination', 'adoption_request', 'adoption_completed', 'transfer', 'status_change', 'other') NOT NULL,
    event_date DATETIME NOT NULL,
    description TEXT,
    performed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table Disponibilité des Vétérinaires
CREATE TABLE IF NOT EXISTS veterinarian_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veterinarian_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE CASCADE
);

-- Table Avis/Évaluations
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_id INT NOT NULL,
    target_type ENUM('veterinarian', 'shelter', 'adoption') NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ajouter la clé étrangère pour shelter_id (après création de la table shelters)
-- Note: Cette commande échouera si la colonne shelter_id existe déjà avec une clé étrangère
-- Dans ce cas, ignorez simplement l'erreur
ALTER TABLE animals ADD CONSTRAINT fk_animals_shelter 
FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE SET NULL;


INSERT INTO users (name, email, password, phone, role, status) VALUES
('Ahmed Alaoui', 'ahmed.alaoui@gmail.com', '$2a$10$YQ3U8LZMvPZvW8lVrGxMy.rGxMxVv3N9X8YQ3U8LZMvPZvW8lVrGxM', '0612345678', 'adopter', 'active'),
('Refuge SPA Casablanca', 'contact@spa-casa.ma', '$2a$10$YQ3U8LZMvPZvW8lVrGxMy.rGxMxVv3N9X8YQ3U8LZMvPZvW8lVrGxM', '0522123456', 'shelter', 'active'),
('Dr. Fatima Benali', 'dr.fatima@vetmaroc.ma', '$2a$10$YQ3U8LZMvPZvW8lVrGxMy.rGxMxVv3N9X8YQ3U8LZMvPZvW8lVrGxM', '0533789012', 'veterinarian', 'active'),
('Sanae El Amrani', 'sanae.elamrani@gmail.com', '$2a$10$YQ3U8LZMvPZvW8lVrGxMy.rGxMxVv3N9X8YQ3U8LZMvPZvW8lVrGxM', '0667890123', 'adopter', 'active');

INSERT INTO shelters (user_id, shelter_name, location, city, phone, email, capacity, description) VALUES
(2, 'Refuge SPA Casablanca', 'Hay Riad', 'Casablanca', '0522123456', 'contact@spa-casa.ma', 80, 'Refuge associatif depuis 2005, spécialisé dans le sauvetage et la réhabilitation des animaux abandonnés au Maroc');

INSERT INTO veterinarians (user_id, license_number, specialization, clinic_name, city, consultation_fee, teleconsultation_available, teleconsultation_fee, years_experience) VALUES
(3, 'VET-MA-2024-001', 'Médecine générale', 'Clinique Vétérinaire Al Amal', 'Casablanca', 300.00, TRUE, 200.00, 12);

INSERT INTO veterinarian_availability (veterinarian_id, day_of_week, start_time, end_time) VALUES
(1, 'monday', '09:00:00', '18:00:00'),
(1, 'tuesday', '09:00:00', '18:00:00'),
(1, 'wednesday', '09:00:00', '18:00:00'),
(1, 'thursday', '09:00:00', '18:00:00'),
(1, 'friday', '09:00:00', '18:00:00'),
(1, 'saturday', '09:00:00', '14:00:00');

INSERT INTO appointments (animal_id, user_id, veterinarian_id, appointment_date, appointment_type, status, reason, fee) VALUES
(1, 1, 1, '2025-10-25 10:00:00', 'checkup', 'scheduled', 'Contrôle de routine', 300.00),
(2, 4, 1, '2025-10-26 14:30:00', 'vaccination', 'confirmed', 'Rappel de vaccin', 250.00);

INSERT INTO messages (sender_id, receiver_id, conversation_id, animal_id, subject, message) VALUES
(1, 2, 'conv_1_2', 1, 'Demande d\'information sur Aziz', 'السلام عليكم، أنا مهتم بتبني أزيز. هل ما زال متاحًا؟'),
(2, 1, 'conv_1_2', 1, 'RE: Demande d\'information sur Aziz', 'وعليكم السلام، نعم أزيز ما زال متاحًا. يمكننا تنظيم لقاء إذا كنت ترغب في ذلك.');

INSERT INTO animal_history (animal_id, event_type, event_date, description, performed_by) VALUES
(1, 'arrival', '2024-08-15 10:00:00', 'Arrivée au refuge - Trouvé errant dans Hay Riad, Casablanca', 2),
(1, 'medical_treatment', '2024-08-16 14:00:00', 'Examen vétérinaire complet - Bonne santé générale', 3),
(1, 'vaccination', '2024-08-16 14:30:00', 'Vaccination complète effectuée', 3),
(2, 'arrival', '2024-09-01 11:00:00', 'Arrivée au refuge - Abandonné par son propriétaire à Casablanca', 2);

