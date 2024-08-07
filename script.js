// script.js
async function fetchResults() {
    const studentId = document.getElementById('student-id').value;
    if (!studentId) {
        alert('Please enter your Student ID');
        return;
    }

    try {
        // Update URL in script.js
        const response = await fetch(`http://localhost:3000/api/validate-student-id?studentId=${studentId}`);
        const result = await response.json();
        
        if (result.valid) {
            window.location.href = `result.html?studentId=${studentId}`;
        } else {
            alert('รหัสนักศึกษาไม่ถูกต้อง ตรวจสอบและลองใหม่อีกครั้งนะ');
        }
    } catch (error) {
        console.error('Error validating student ID:', error);
        alert('An error occurred while validating your Student ID. Please try again.');
    }
}
