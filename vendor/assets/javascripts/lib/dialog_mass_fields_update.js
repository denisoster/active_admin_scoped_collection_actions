ActiveAdmin.dialogMassFieldsUpdate = function (message, inputs, callback) {
  let html = `<form id="dialog_confirm" title="${message}"><div style="padding-right:4px;padding-left:1px;margin-right:2px"><ul>`;

  for (let name in inputs) {
    let elem, opts, wrapper;
    let type = inputs[name];

    if (/^(datepicker|checkbox|text)$/.test(type)) {
      wrapper = 'input';
    } else if ($.isArray(type)) {
      [wrapper, elem, opts, type] = ['select', 'option', type, ''];
    } else {
      throw new Error(`Unsupported input type: {${name}: ${type}}`);
    }

    let klass = type === 'datepicker' ? type : '';
    html += `<li>
      <input type='checkbox' class='mass_update_protect_fild_flag' value='Y' id="mass_update_dialog_${name}" />
      <label for="mass_update_dialog_${name}"> ${name.charAt(0).toUpperCase() + name.slice(1)}</label>
      <${wrapper} name="${name}" class="${klass}" type="${type}" disabled="disabled">`;

    if (opts) {
      html += opts.map((v) => {
        const $elem = $(`<${elem}/>`);
        if ($.isArray(v)) {
          $elem.text(v[0]).val(v[1]);
        } else {
          $elem.text(v);
        }
        return $elem.wrap('<div>').parent().html();
      }).join('');
    }

    if (wrapper === 'select') {
      html += `</${wrapper}>`;
    }

    html += "</li>";

    [wrapper, elem, opts, type, klass] = [];
  }

  html += "</ul></div></form>";

  const form = $(html).appendTo('body');

  $('body').trigger('mass_update_modal_dialog:before_open', [form]);

  return form.dialog({
    modal: true,
    dialogClass: 'active_admin_dialog active_admin_dialog_mass_update_by_filter',
    maxHeight: window.innerHeight - (window.innerHeight * 0.1),
    open() {
      $('body').trigger('mass_update_modal_dialog:after_open', [form]);
      return $('.mass_update_protect_fild_flag').on('change', function (e) {
        if (this.checked) {
          return $(e.target).next().next().removeAttr('disabled').trigger("chosen:updated");
        } else {
          return $(e.target).next().next().attr('disabled', 'disabled').trigger("chosen:updated");
        }
      });
    },
    buttons: {
      OK(e) {
        $(e.target).closest('.ui-dialog-buttonset').html('<span>Processing. Please wait...</span>');
        return callback($(this).serializeObject());
      },
      Cancel() {
        $('.mass_update_protect_fild_flag').off('change');
        return $(this).dialog('close').remove();
      }
    }
  });
};
