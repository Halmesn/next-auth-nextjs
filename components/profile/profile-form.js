import classes from './profile-form.module.css';
import { useRef } from 'react';

function ProfileForm() {
  const newPasswordInputRef = useRef();
  const oldPasswordInputRef = useRef();

  const formSubmitHandler = async (event) => {
    event.preventDefault();

    const enteredNewPassword = newPasswordInputRef.current.value;
    const enteredOldPassword = oldPasswordInputRef.current.value;

    const formData = {
      newPassword: enteredNewPassword,
      oldPassword: enteredOldPassword,
    };

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PATCH',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <form className={classes.form} onSubmit={formSubmitHandler}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input
          type="password"
          id="new-password"
          required
          minLength={6}
          ref={newPasswordInputRef}
        />
      </div>
      <div className={classes.control}>
        <label htmlFor="old-password">Old Password</label>
        <input
          type="password"
          id="old-password"
          required
          minLength={6}
          ref={oldPasswordInputRef}
        />
      </div>
      <div className={classes.action}>
        <button>Change Password</button>
      </div>
    </form>
  );
}

export default ProfileForm;
