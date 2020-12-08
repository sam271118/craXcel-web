# [www.craXcel.com](https://www.craxcel.com)

Web application to unlock Microsoft Office password protected files.

---

![craxcel-web](https://user-images.githubusercontent.com/50495755/101543521-42016080-399c-11eb-91ed-93a1f3c7f582.png)

---

# What is craXcel

craXcel ("crack-cel") is a tool that makes removing various password protections from Microsoft Office files seemless. It works by directly amending the underlying XML files that make up modern Microsoft Office files.

Please note that craXcel cannot unlock encrypted files.

---

# Supported applications

- Microsoft Excel
  - .xlsx
  - .xlsm
- Microsoft Word
  - .docx
  - .docm
- Microsoft Powerpoint
  - .pptx
  - .pptm

Others may work, but have not been tested.

## Important note on unlocking the VBA project of macro files

Upon unlocking the VBA Project of a Macro Enabled file, that file will state it has encountered issues and needs to recover... __DO NOT PANIC__, this is normal.

The steps to follow to complete the unlock is as follows:

1. Open the unlocked file and click 'Enable Content' on the warning:

![image](https://user-images.githubusercontent.com/50495755/94193731-9e2e0b80-fea8-11ea-818f-45ac9ac7b80e.png)

2. Click 'OK' on the following pop-up:

![image](https://user-images.githubusercontent.com/50495755/94193790-b56cf900-fea8-11ea-8f73-2b27378b1e3d.png)

3. Open Visual Basic from the Developer toolbar:

![image](https://user-images.githubusercontent.com/50495755/94193894-d59cb800-fea8-11ea-9cc6-6a88008a853e.png)

4. Open VBAProject Propeties under Tools:

![image](https://user-images.githubusercontent.com/50495755/94193982-f5cc7700-fea8-11ea-8dad-9d0ccb3cf921.png)

5. Navigate to the Protection tab and enter a new password (a one character password is fine, as we will be removing it again straight away). Click 'OK'.

![image](https://user-images.githubusercontent.com/50495755/94194050-0ed52800-fea9-11ea-9cf9-315a1a0fc7fc.png)

6. Head back in to VBAProject Properties > Protection tab, and de-select the 'Lock project for viewing' checkbox and clear any passwords in the boxes below. Click 'OK'.

7. The modules will now be unlocked and you can save the document without having to repeat these steps.

![image](https://user-images.githubusercontent.com/50495755/94194188-40e68a00-fea9-11ea-9f1d-77ea49010a4b.png)
