const quizData = [
    {
        question: "1) Theo quan điểm của C.Mác và Ph.Ăngghen, điều kiện để một người được kết nạp vào Đảng.",
        options: [
            "Tán thành cương lĩnh của Đảng, tự nguyện tham gia các phong trào quần chúng",
            "Thừa nhận thế giới quan cộng sản chủ nghĩa, hoạt động phù hợp, nộp đảng phí đầy đủ",
            "Có nguồn gốc xuất thân từ giai cấp công nhân hoặc nông dân nghèo",
            "Đạt được thành tích xuất sắc trong lao động sản xuất và chiến đấu"
        ],
        answer: 1 // Đáp án B
    },
    {
        question: "2) Theo quan điểm của Lênin, quy luật phổ biến về sự ra đời của Đảng Cộng sản là sự kết hợp giữa những yếu tố.",
        options: [
            "Chủ nghĩa Mác - Lênin và phong trào yêu nước",
            "Phong trào công nhân và phong trào giải phóng dân tộc",
            "Lý luận tiên phong và sự giác ngộ của giai cấp vô sản",
            "Chủ nghĩa Mác và phong trào công nhân"
        ],
        answer: 3 // Đáp án D
    },
    {
        question: "3) Theo Lênin, chủ nghĩa Mác giữ vai trò gì đối với Đảng Cộng sản.",
        options: [
            "Là vũ khí lý luận sắc bén để đấu tranh giai cấp",
            "Là cơ sở để vạch ra cương lĩnh chính trị của Đảng",
            "Là nền tảng tư tưởng, kim chỉ nam cho mọi hoạt động của Đảng",
            "Là định hướng chiến lược cho phong trào công nhân quốc tế"
        ],
        answer: 2 // Đáp án C
    },
    {
        question: "4) Theo quan điểm của Lênin, tiêu chí quan trọng để xem xét một đảng có phải là chính đảng Mácxít hay không.",
        options: [
            "Lấy chủ nghĩa Mác làm nền tảng tư tưởng, kim chỉ nam cho mọi hành động",
            "Lấy nguyên tắc tập trung dân chủ làm nền tảng tổ chức",
            "Lấy giai cấp công nhân làm lực lượng nòng cốt",
            "Lấy mục tiêu xây dựng chủ nghĩa xã hội làm định hướng"
        ],
        answer: 0 // Đáp án A
    },
    {
        question: "5) Một trong những nguy hiểm lớn nhất đối với Đảng cầm quyền mà V.I.Lênin cảnh báo.",
        options: [
            "Mất đoàn kết nội bộ, bè phái cục bộ",
            "Xa rời quần chúng, mắc bệnh quan liêu",
            "Suy thoái về tư tưởng chính trị, đạo đức, lối sống",
            "Xa rời mục tiêu độc lập dân tộc và chủ nghĩa xã hội"
        ],
        answer: 1 // Đáp án B
    },
    {
        question: "6) V.I.Lênin coi đoàn kết thống nhất trong Đảng.",
        options: [
            "Nguyên tắc tổ chức cơ bản để xây dựng Đảng vững mạnh",
            "Yếu tố then chốt để tập hợp lực lượng quần chúng cách mạng",
            "Quy luật tồn tại và phát triển; nguồn sức mạnh vô tận của Đảng",
            "Động lực chủ yếu để vượt qua mọi khó khăn thử thách"
        ],
        answer: 2 // Đáp án C
    },
    {
        question: "7) V.I.Lênin yêu cầu phải kiên quyết “đuổi cổ ra khỏi Đảng những đối tượng.",
        options: [
            "Những kẻ cơ hội, quan liêu không trung thực",
            "Những người vi phạm kỷ luật quân đội và pháp luật nhà nước",
            "Những đảng viên giảm sút ý chí chiến đấu, lười học tập",
            "Những người có tư tưởng trung bình chủ nghĩa, ngại gian khổ"
        ],
        answer: 0 // Đáp án A
    },
    {
        question: "8) V.I.Lênin khẳng định: “Không có lý luận cách mạng thì cũng không thể có phong trào cách mạng”. Câu nói nhấn mạnh.",
        options: [
            "Mối quan hệ biện chứng giữa lý luận và thực tiễn",
            "Vai trò quyết định của lý luận tiên phong",
            "Tính tất yếu của phong trào đấu tranh giai cấp",
            "Tầm quan trọng của việc học tập lý luận chính trị thường xuyên"
        ],
        answer: 1 // Đáp án B
    },
    {
        question: "9) Theo quan điểm của Mác - Ăngghen, điều kiện tiên quyết để giai cấp công nhân có thể thực hiện được sứ mệnh lịch sử của mình.",
        options: [
            "Tiến hành cách mạng bạo lực để lật đổ giai cấp tư sản",
            "Liên minh chặt chẽ với giai cấp nông dân và tầng lớp trí thức",
            "Thành lập chính đảng độc lập của giai cấp công nhân",
            "Giác ngộ sứ mệnh lịch sử và không ngừng đoàn kết quốc tế"
        ],
        answer: 2 // Đáp án C
    },
    {
        question: "10) Khẩu hiệu “Vô sản tất cả các nước đoàn kết lại trong Tuyên ngôn của Đảng Cộng sản thể hiện nội dung nào.",
        options: [
            "Mục tiêu đấu tranh lật đổ chủ nghĩa tư bản toàn cầu",
            "Sức mạnh vô địch của giai cấp vô sản trên toàn thế giới",
            "Khát vọng hòa bình và tự do của nhân dân lao động",
            "Tư tưởng đoàn kết quốc tế của giai cấp công nhân"
        ],
        answer: 3 // Đáp án D
    }
];