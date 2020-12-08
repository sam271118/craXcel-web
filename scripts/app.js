'use strict';

(function () {
    AWS.config.update({
        region: 'eu-west-1',
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'eu-west-1:c0d7c0b3-6e78-4e0c-8458-f863e6c8f6be'
        })
    })

    AWS.config.getCredentials(function (error) {
        if (error) console.log('There was an error communicating with the server')
    })

    //Individual Elements
    const downloadLink = document.querySelector('#downloadLink')
    const fail = document.querySelector('#fail')
    const fileInput = document.querySelector('#fileInput')
    const fileRejected = document.querySelector('#fileRejected')
    const form = document.querySelector('#craxcelForm')
    const selectFile = document.querySelector('#selectFile')
    const success = document.querySelector('#success')
    const unlockButton = document.querySelector('#unlockButton')

    //Element Collections
    const fileInfoElements = document.querySelectorAll('.file-info')
    const fileNameElements = document.querySelectorAll('.file-name')

    //Event Listeners
    fileInput.addEventListener('change', addFile)
    form.addEventListener('change', setButtonStatus)
    unlockButton.addEventListener('click', processFile)

    const fileValidations = {
        maxFileSizeInBytes: 10 * 1024 * 1024,
        supportedExtensions: {
            xlsx: 'excel',
            xlsm: 'excel',
            docx: 'word',
            docm: 'word',
            pptx: 'powerpoint',
            pptm: 'powerpoint'
        },
        supportedApplications() {
            return [...new Set(Object.values(this.supportedExtensions))]
        }
    }

    //Sets the file input to filter for supported file extensions only
    fileInput.setAttribute('accept', Object.keys(fileValidations.supportedExtensions).map(ext => `.${ext}`).join())

    const bytesToMb = (bytes, toDecimalPlaces) => (bytes / 1048576).toFixed(toDecimalPlaces)
    const delay = ms => new Promise(res => setTimeout(res, ms))

    function loadPage(pageId) {
        const hiddenClass = 'is-hidden'

        for (let page of ['#startPage', '#processingPage', '#finishedPage']) {
            document.querySelector(page).classList.add(hiddenClass)
        }

        document.querySelector(pageId).classList.remove(hiddenClass)
    }

    function addFile() {
        resetFileInputLabel()

        const validationResult = validateFileInput()

        const addFileResult = {
            isSuccessful: validationResult.isSuccessful,
            errors: validationResult.errors
        }

        updateFileLabel(addFileResult)
    }

    function validateFileInput() {
        const files = fileInput.files
        const errors = []

        if (files.length) {
            errors.push(...validateFile(files[0]).errors)
        } else {
            errors.push('No file had been added.')
        }

        return {
            isSuccessful: errors.length > 0 ? false : true,
            errors: errors
        }
    }

    function setButtonStatus() {
        if (termsCheckbox.checked & validateFileInput().isSuccessful) {
            unlockButton.disabled = false
        } else {
            unlockButton.disabled = true
        }
    }

    function updateFileLabel(addFileResult) {
        if (addFileResult.isSuccessful) {
            const file = fileInput.files[0]
            const fileExtension = file.name.split('.').pop()

            const fileSvgElements = document.querySelectorAll(`.${fileValidations.supportedExtensions[fileExtension]}-svg`)
            for (let element of fileSvgElements) element.classList.remove('is-hidden')

            selectFile.classList.add('is-hidden')

            for (let element of fileNameElements) element.textContent = file.name

            for (let element of fileInfoElements) element.classList.remove('is-hidden')
        } else {
            for (let error of addFileResult.errors) fileRejected.appendChild(document.createTextNode(error))

            fileRejected.classList.remove('is-hidden')
        }
    }

    function resetFileInputLabel() {
        fileInput.values = ''

        for (let application of fileValidations.supportedApplications()) {
            let svgElements = document.querySelectorAll(`.${application}-svg`)

            for (let element of svgElements) element.classList.add('is-hidden')
        }

        selectFile.classList.remove('is-hidden')

        for (let element of fileNameElements) element.textContent = ''

        for (let element of fileInfoElements) element.classList.add('is-hidden')

        fileRejected.innerHTML = ''
        fileRejected.classList.add('is-hidden')
        unlockButton.disabled = true
    }

    function validateFile(file) {
        const errors = [...validateFileSize(file), ...validateFileExtension(file)]

        return {
            isValid: errors.length > 0 ? true : false,
            errors: errors
        }
    }

    function validateFileSize(file) {
        const errors = []

        if (file.size > fileValidations.maxFileSizeInBytes) {
            errors.push(`File ${file.name} is too large (${bytesToMb(file.size, 2)}MB), must be ${bytesToMb(fileValidations.maxFileSizeInBytes, 2)}MB or less.`)
        }

        return errors
    }

    function validateFileExtension(file) {
        const errors = []

        const fileExtension = file.name.split('.').pop()
        if (!(fileExtension in fileValidations.supportedExtensions)) {
            errors.push(`File ${file.name} is not a supported file extension.`)
        }

        return errors
    }

    async function processFile() {
        try {
            const file = fileInput.files[0]
            unlockButton.disabled = true

            const userId = AWS.config.credentials.identityId.split(':')[1]
            const fileKey = `${userId}/${file.name}`

            const uploadResult = await uploadFile(file, fileKey)
            const unlockResult = uploadResult.isSuccessful ? await unlockFile(fileKey) : uploadResult

            await displayUnlockResult(unlockResult)
        }
        catch (error) {
            return {
                isSuccessful: false,
                error: error
            }
        }
    }

    async function uploadFile(file, fileKey) {
        try {
            validateFile(file)

            loadPage('#processingPage')
            updateStatus('Uploading locked file')

            const upload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: 'craxcel.uploads',
                    Key: fileKey,
                    Body: file
                },
                options: {
                    partSize: fileValidations.maxFileSizeInBytes,
                    queueSize: 1
                }
            })

            await upload.promise()

            return { isSuccessful: true }
        }
        catch {
            return {
                isSuccessful: false,
                error: error
            }
        }
    }

    async function unlockFile(fileKey) {
        try {
            const publicApiKey = '9W5eTWxqoq1f7Xp9chJdH8kjkFscUmPn25Q1MJAQ'

            updateStatus('Unlocking')
            const response = await axios.get(`https://pu1u7d17lj.execute-api.eu-west-1.amazonaws.com/prod/?key=${fileKey}`, {
                headers: {
                    'x-api-key': publicApiKey
                }
            })

            //Bit meh to force delays, but it feels smoother than instantly jumping through the process for smaller files
            updateStatus('Finishing up')
            await delay(2000)

            return {
                isSuccessful: true,
                signedUrl: response.data
            }
        }
        catch (error) {
            return {
                isSuccessful: false,
                error: error
            }
        }
    }

    async function displayUnlockResult(unlockResult) {
        if (unlockResult.isSuccessful) {
            downloadLink.setAttribute('href', unlockResult.signedUrl)
            success.classList.remove('is-hidden')
        } else {
            fail.classList.remove('is-hidden')
        }

        loadPage('#finishedPage')
        downloadLink.click()
    }

    function updateStatus(text) {
        const unlockStatus = document.querySelector('#unlockStatus')

        unlockStatus.textContent = text
    }
}())