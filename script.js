// script.js
async function fetchResults() {
    const studentId = document.getElementById('student-id').value;
    if (!studentId) {
        alert('Please enter your Student ID');
        return;
    }

    try {
        const response = await fetch(`https://safe-savannah-37690-21aadeb098f5.herokuapp.com/api/validate-student-id?studentId=${studentId}`);
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
