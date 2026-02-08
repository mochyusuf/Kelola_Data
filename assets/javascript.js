const input_buku = document.getElementById('inputBuku');
const cari_buku = document.getElementById('cariBuku');
const title_bar = document.getElementById('title_form');

document.addEventListener('DOMContentLoaded', function() {
    input_buku.addEventListener('submit', (event) => {
        event.preventDefault();
        add_buku();
    })

    cari_buku.addEventListener('submit', (event) => {
        event.preventDefault();
        cari__buku();
    })

    if (is_storage_exist()) {
        load_data_from_storage();
    }

})

const RENDER_BUKU = 'render-buku';
const SAVE_EVENT = 'save-buku';
const STORAGE_KEY = 'RAK_BUKU';
const to_buku = [];
const found_buku = [];

function generate_id() {
    return +new Date();
}

function generate_buku(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function find_buku(buku_id) {
    for (const buku of to_buku) {
        if (buku.id === buku_id) {
            return buku;
        }
    }
    return null;
}

document.addEventListener(RENDER_BUKU, function() {
    const selesai_buku = document.getElementById('selesaiBukufList');
    const belum_buku = document.getElementById('belumBukuList');
    const key_buku = document.getElementById('cariBukuJudul').value;
    selesai_buku.innerHTML = '';
    belum_buku.innerHTML = '';

    if (key_buku == '') {
        for (const buku of to_buku) {
            const card_buku = make_card_buku(buku);
            if (buku.isComplete) {
                selesai_buku.append(card_buku);
            } else {
                belum_buku.append(card_buku);
            }
        }
    } else {
        for (const buku of found_buku) {
            const card_buku = make_card_buku(buku);
            if (buku.isComplete) {
                selesai_buku.append(card_buku);
            } else {
                belum_buku.append(card_buku);
            }
        }
    }
})


function handler_selesai_buku(buku_id) {
    const buku_target = find_buku(buku_id);

    if (buku_target === null) return;
    console.log(buku_target);
    buku_target.isComplete = false;
    document.dispatchEvent(new Event(RENDER_BUKU));
    save_data();
}

function handler_belum_buku(buku_id) {
    const buku_target = find_buku(buku_id);

    if (buku_target === null) return;

    buku_target.isComplete = true;
    document.dispatchEvent(new Event(RENDER_BUKU));
    save_data();
}

function handler_hapus_buku(buku_id) {
    const buku_target = find_to_index(buku_id);

    if (buku_target === -1) return;

    to_buku.splice(buku_target, 1);
    document.dispatchEvent(new Event(RENDER_BUKU));
    save_data();
}

function find_to_index(buku_id) {
    for (const index in to_buku) {
        if (to_buku[index].id === buku_id) {
            return index;
        }
    }

    return -1;
}

function make_card_buku({ id, title, author, year, isComplete }) {
    const judul_element = document.createElement('h3');
    judul_element.innerText = `${title}`;
    judul_element.setAttribute('data-testid', 'bookItemTitle');

    const penulis_element = document.createElement('p');
    penulis_element.innerText = `Penulis : ${author}`;
    penulis_element.setAttribute('data-testid', 'bookItemAuthor');

    const tahun_element = document.createElement('p');
    tahun_element.innerText = `Tahun : ${year}`;
    tahun_element.setAttribute('data-testid', 'bookItemYear');

    const btn_aksi = document.createElement('button');
    btn_aksi.setAttribute('data-testid', 'bookItemIsCompleteButton');

    const btn_hapus = document.createElement('button');
    btn_hapus.classList.add('red');
    btn_hapus.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    btn_hapus.setAttribute('data-testid', 'bookItemDeleteButton');

    btn_hapus.addEventListener('click', function() {
        const confirm_remove = confirm("Apakah anda akan menghapus buku ini?");
        if (confirm_remove === true) return handler_hapus_buku(id);
    })

    const div_element = document.createElement('div');
    div_element.classList.add('action');
    div_element.append(btn_aksi, btn_hapus);

    const artikel_element = document.createElement('artikel');
    artikel_element.classList.add('buku_item');
    artikel_element.setAttribute('id', `${id}`);
    artikel_element.setAttribute('data-testid', 'bookItem');
    artikel_element.setAttribute('data-bookid', `${id}`);
    artikel_element.append(judul_element, penulis_element, tahun_element, div_element);

    if (isComplete) {
        btn_aksi.classList.add('blue');
        btn_aksi.innerHTML = `<i class="fa-solid fa-book"></i>`;
        btn_aksi.addEventListener('click', function() {
            handler_selesai_buku(id);
        })
    } else {
        btn_aksi.classList.add('green');
        btn_aksi.innerHTML = `<i class="fa-solid fa-book-open"></i>`;
        btn_aksi.addEventListener('click', function() {
            handler_belum_buku(id);
        })
    }
    return artikel_element;
}

function input_form_data() {
    const form_data = {};

    form_data['title'] = document.getElementById('inputBukuJudul').value;
    form_data['author'] = document.getElementById('inputBukuPenulis').value;
    form_data['year'] = parseInt(document.getElementById('inputBukuTahun').value);
    form_data['isComplete'] = document.getElementById('inputBukuIsSelesai').checked;

    return form_data;
}

function reset_form_data() {
    document.getElementById('inputBukuJudul').value = '';
    document.getElementById('inputBukuPenulis').value = '';
    document.getElementById('inputBukuTahun').value = '';
    document.getElementById('inputBukuIsSelesai').checked = false;
    return;
}

function add_buku() {
    reset_form_cari()
    const { title, author, year, isComplete } = input_form_data();
    const id = generate_id();
    const bukus = generate_buku(id, title, author, year, isComplete);
    reset_form_data();

    if (to_buku.push(bukus)) {
        title_bar.innerText = "Buku berhasil disimpan";
        title_bar.classList.add('sukses');
    }

    document.dispatchEvent(new Event(RENDER_BUKU));
    save_data();
}

function cari__buku() {
    const key_buku = document.getElementById('cariBukuJudul').value
    const buku = find_judul_buku(key_buku);
    if (buku == -1 || found_buku.length > 1) {
        found_buku.splice(0, found_buku.length);
    } else if (found_buku.length == 1) {
        return false;
    } else {
        found_buku.push(buku);
    }

    document.dispatchEvent(new Event(RENDER_BUKU));
    save_data();
}

function find_judul_buku(title) {

    for (const index in to_buku) {
        if (to_buku[index].title == title) {
            return to_buku[index];
        }
    }
    return -1
}

function reset_form_cari() {
    document.getElementById('cariBukuJudul').value = '';
    return;
}

function save_data() {
    if (is_storage_exist()) {
        const parsed = JSON.stringify(to_buku);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVE_EVENT));
    }
}

function is_storage_exist() {
    if (typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function load_data_from_storage() {
    const serialize_data = localStorage.getItem(STORAGE_KEY);
    let data_obj = JSON.parse(serialize_data);

    if (data_obj !== null) {
        for (const buku of data_obj) {
            to_buku.push(buku);
        }
    }
    document.dispatchEvent(new Event(RENDER_BUKU));
}
